from abc import ABC, abstractmethod
from typing import List, Dict, Any, Tuple, Optional
from ...models.schemas import Provider, Order

class BaseProviderAdapter(ABC):
    def __init__(self, provider: Provider):
        self.provider = provider
        self.api_url = provider.api_url.rstrip("/")
        self.api_key = provider.api_key
        self.secret = provider.secret
        self.api_username = provider.api_username

    @abstractmethod
    def test_connection(self) -> Tuple[bool, str, Dict[str, Any]]:
        pass

    @abstractmethod
    def get_games(self) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_products(self, game_slug_or_code: str) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def create_topup(self, order: Order) -> Tuple[bool, str, Optional[str], Optional[str]]:
        pass

    @abstractmethod
    def check_order_status(self, order: Order) -> Tuple[str, Optional[str]]:
        pass

    @abstractmethod
    def verify_webhook(self, payload: bytes, signature: str, secret: str) -> bool:
        pass
