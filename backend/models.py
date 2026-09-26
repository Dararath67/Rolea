from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

CategoryType = Literal['all', 'mobile', 'pc', 'voucher', 'airtime']
OrderStatusType = Literal['pending_payment', 'verifying_slip', 'processing', 'completed', 'rejected']

class TopUpPackage(BaseModel):
    id: str
    name: str
    price: float
    originalPrice: Optional[float] = None
    icon: Optional[str] = ''
    bonus: Optional[str] = None
    popular: Optional[bool] = False

class InputField(BaseModel):
    id: str
    label: str
    placeholder: str
    type: Optional[Literal['text', 'number']] = 'text'
    required: bool = True
    helperText: Optional[str] = None

class GameProduct(BaseModel):
    id: str
    slug: str
    title: str
    subtitle: str
    category: Literal['mobile', 'pc', 'voucher', 'airtime']
    publisher: str
    thumbnail: str
    banner: str
    badge: Optional[str] = None
    currencyName: str = 'Diamonds'
    instantDelivery: bool = True
    fields: List[InputField] = []
    packages: List[TopUpPackage] = []
    instructionGuide: Optional[str] = None
    isActive: bool = True

class PaymentMethod(BaseModel):
    id: str
    name: str
    category: Literal['qr', 'ewallet', 'card', 'bank']
    icon: str
    feePercentage: float = 0.0
    feeFixed: float = 0.0
    accountName: Optional[str] = None
    accountNumber: Optional[str] = None
    qrImage: Optional[str] = None
    badge: Optional[str] = None

class OrderCreate(BaseModel):
    productSlug: str
    productTitle: Optional[str] = None
    productThumbnail: Optional[str] = None
    packageId: str
    packageName: Optional[str] = None
    price: float
    discount: float = 0.0
    fee: float = 0.0
    total: float
    currency: str = 'THB'
    inputs: Dict[str, str] = Field(default_factory=dict)
    paymentMethodId: str
    paymentMethodName: Optional[str] = None
    status: Optional[OrderStatusType] = 'pending_payment'
    customerContact: Optional[str] = ''
    notes: Optional[str] = None
    slipImage: Optional[str] = None

class OrderUpdate(BaseModel):
    status: Optional[OrderStatusType] = None
    slipImage: Optional[str] = None
    notes: Optional[str] = None
    deliveredCode: Optional[str] = None

class Order(BaseModel):
    id: str
    createdAt: str
    updatedAt: str
    productSlug: str
    productTitle: str
    productThumbnail: str
    packageId: str
    packageName: str
    price: float
    discount: float
    fee: float
    total: float
    currency: str
    inputs: Dict[str, str]
    paymentMethodId: str
    paymentMethodName: str
    status: OrderStatusType
    slipImage: Optional[str] = None
    customerContact: str
    notes: Optional[str] = None
    deliveredCode: Optional[str] = None

class DashboardStats(BaseModel):
    totalRevenue: float
    totalOrders: int
    pendingOrders: int
    completedOrders: int
    conversionRate: int
    recentOrders: List[Order]
