# model_server.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from peft import PeftModel
import uvicorn

# -------------------------------
# 1️⃣ FastAPI App Setup
# -------------------------------
app = FastAPI()

# Enable CORS so Express (localhost:5000) can call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://127.0.0.1:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# 2️⃣ Load Model + Tokenizer Once
# -------------------------------
print("🧠 Loading model...")

base_model_name = "unsloth/Llama-3-8B-bnb-4bit"
checkpoint_path = "/kaggle/input/checkpoint-1750"  # update to your local path if needed

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16,
)

model = AutoModelForCausalLM.from_pretrained(
    base_model_name,
    quantization_config=bnb_config,
    device_map="auto",
    trust_remote_code=True,
)

tokenizer = AutoTokenizer.from_pretrained(base_model_name)
tokenizer.pad_token = tokenizer.eos_token

# Apply LoRA adapter
model = PeftModel.from_pretrained(model, checkpoint_path)
model.eval()

print("✅ Model loaded successfully.")

# -------------------------------
# 3️⃣ API Endpoint: /api/model
# -------------------------------
instruction = (
    "You are an impartial AI Judge that evaluates how persuasive an argument is on a given topic. "
    "Assess the argument based on clarity, reasoning, structure, and coherence.\n\n"
    "Scoring Guide:\n"
    "- 0–20: Illogical or incoherent\n"
    "- 21–50: Weak reasoning or minimal support\n"
    "- 51–80: Reasonable but lacks depth or structure\n"
    "- 81–100: Strong, logical, well-developed, and convincing\n\n"
    "Provide your evaluation using the exact format below:\n\n"
    "--- 🏛️ AI JUDGE VERDICT 🏛️ ---\n"
    "TOPIC: <topic name>\n"
    "PERSUASIVENESS_SCORE: <number>\n"
    "JUSTIFICATION: <1–3 sentences explaining why the score was given>\n"
    "IMPROVEMENTS: <specific suggestions, or 'No improvements necessary' if perfect>\n"
)

@app.post("/api/model")
async def evaluate(request: Request):
    """Receives debate arguments, runs model inference, and returns structured JSON"""
    data = await request.json()
    argument = data.get("arguments", "")

    prompt = f"""### INSTRUCTION:
{instruction}

### RESPONSE:
Topic: General
Argument: {argument}
"""

    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=150,
            temperature=0.9,
            do_sample=True,
            repetition_penalty=1.1,
            eos_token_id=tokenizer.eos_token_id,
        )

    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    clean = response.split("### RESPONSE:")[-1].strip()

    # Extract structured fields from the text
    result = {"score": None, "justification": "", "improvements": ""}
    for line in clean.split("\n"):
        if "PERSUASIVENESS_SCORE:" in line:
            try:
                result["score"] = int(line.split(":")[1].strip())
            except:
                result["score"] = None
        elif "JUSTIFICATION:" in line:
            result["justification"] = line.split(":", 1)[1].strip()
        elif "IMPROVEMENTS:" in line:
            result["improvements"] = line.split(":", 1)[1].strip()

    print("✅ Model evaluated argument.")
    return result


# -------------------------------
# 4️⃣ Run Server
# -------------------------------
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5001)
