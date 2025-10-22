import requests
import json

class ModelClient:
    def __init__(self):
        self.api_url = "https://thermochemical-chin-nondiffractive.ngrok-free.dev/api/model"
    
    def evaluate_submission(self, submission_data):
        """
        Send submission data to the Kaggle notebook API for evaluation
        
        Args:
            submission_data (dict): Dictionary containing:
                - code: str - The submitted code
                - test_cases: list - List of test cases
                - language: str - Programming language
                
        Returns:
            dict: Response from the model containing evaluation results
        """
        try:
            headers = {
                'Content-Type': 'application/json'
            }
            
            response = requests.post(
                self.api_url,
                json=submission_data,
                headers=headers,
                timeout=30  # 30 second timeout
            )
            
            response.raise_for_status()  # Raise an exception for bad status codes
            return response.json()
            
        except requests.exceptions.RequestException as e:
            return {
                'error': True,
                'message': f'Error connecting to model service: {str(e)}'
            }
        except json.JSONDecodeError:
            return {
                'error': True, 
                'message': 'Invalid response from model service'
            }