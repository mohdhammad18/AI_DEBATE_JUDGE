# AI Debate Judge

AI Debate Judge scores an argument while the debate is still running. A team of three built it and finished 3rd. Each speech is read as it is submitted, and the judge returns three things: how persuasive the argument is, how well the claims are justified, and what the speaker should improve.

The scoring model is Llama-3 8B, fine-tuned with PEFT-QLoRA on 21,000 samples from IBMArgQ. Training in 4-bit QLoRA cut memory use by 75 percent and reduced training loss by 60 percent. The tuned model is served by a FastAPI service. The debate screen calls that service over REST as soon as a speaker finishes, so the score arrives during the round rather than after it.

The study screen is a React application. Debate accounts and sessions are stored through a Node service. Judging itself stays in the Python service, separate from the page the speakers see.
