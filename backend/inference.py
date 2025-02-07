from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
from typing import List, Dict, Optional

class LLMInference:
    def __init__(self):
        self.model_name = "OpenAssistant/llama-13b-orca-8k-3319"  # Używamy tego jako fallback
        self.model = None
        self.tokenizer = None
        self.max_length = 512
        self.temperature = 0.7
        
        # Szablony promptów
        self.templates = {
            'task': """
            Zadanie: {content}
            Kontekst: {context}
            Odpowiedź:""",
            
            'note': """
            Notatka: {content}
            Kategoria: {category}
            Odpowiedź:""",
            
            'chat': """
            <instrukcja>Jesteś pomocnym asystentem. Pamiętaj o historii rozmowy i odpowiadaj w sposób spójny z poprzednimi wypowiedziami. Staraj się kontynuować rozmowę w naturalny sposób.</instrukcja>

            Historia rozmowy:
            {history}

            Użytkownik: {message}
            Asystent:"""
        }
    
    def initialize(self):
        """Inicjalizacja modelu i tokenizera"""
        try:
            print("Ładowanie modelu i tokenizera...")
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                torch_dtype=torch.float32,
                low_cpu_mem_usage=True
            )
            
            # Konfiguracja tokenizera
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
                self.model.config.pad_token_id = self.tokenizer.eos_token_id
                
            print("Model załadowany pomyślnie!")
            return True
        except Exception as e:
            print(f"Błąd ładowania modelu: {str(e)}")
            return False
    
    def generate_response(self, 
                         prompt: str, 
                         history: Optional[List[Dict[str, str]]] = None,
                         context: Optional[Dict[str, str]] = None) -> str:
        """Generuje odpowiedź na podstawie promptu i historii"""
        try:
            # Przygotuj historię rozmowy
            history_text = ""
            if history:
                for msg in history[-5:]:  # Ostatnie 5 wiadomości
                    history_text += f"{msg['role'].title()}: {msg['content']}\n"
            
            # Wybierz szablon i przygotuj prompt
            if context and 'type' in context:
                template = self.templates[context['type']]
                full_prompt = template.format(
                    content=prompt,
                    context=context.get('context', ''),
                    category=context.get('category', ''),
                    history=history_text,
                    message=prompt
                )
            else:
                full_prompt = self.templates['chat'].format(
                    history=history_text,
                    message=prompt
                )
            
            # Tokenizacja
            inputs = self.tokenizer(
                full_prompt,
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=self.max_length
            )
            
            # Generowanie odpowiedzi
            with torch.no_grad():
                outputs = self.model.generate(
                    inputs["input_ids"],
                    max_new_tokens=100,
                    temperature=self.temperature,
                    top_p=0.9,
                    top_k=50,
                    no_repeat_ngram_size=3,
                    do_sample=True,
                    pad_token_id=self.tokenizer.pad_token_id
                )
            
            # Dekodowanie odpowiedzi
            response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Wyciągnij tylko odpowiedź asystenta
            response = response.split("Asystent:")[-1].strip()
            
            return response
            
        except Exception as e:
            print(f"Błąd generowania odpowiedzi: {str(e)}")
            return "Przepraszam, wystąpił błąd podczas generowania odpowiedzi." 