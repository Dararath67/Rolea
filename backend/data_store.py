import random
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from .models import GameProduct, TopUpPackage, PaymentMethod, Order, OrderCreate, OrderUpdate, DashboardStats

# Seed Initial Products
INITIAL_PRODUCTS: List[GameProduct] = [
    GameProduct(
        id='mlbb',
        slug='mobile-legends',
        title='Mobile Legends: Bang Bang',
        subtitle='Fast and reliable diamond top-up via Moonton direct ID',
        category='mobile',
        publisher='Moonton',
        thumbnail='https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&auto=format&fit=crop&q=80',
        banner='https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80',
        badge='HOT ',
        currencyName='Diamonds',
        instantDelivery=True,
        instructionGuide='To find your User ID and Zone ID, tap on your avatar in the top-left corner of the main game screen. Your User ID is in the format 12345678 (1234).',
        fields=[
            {'id': 'userId', 'label': 'User ID', 'placeholder': 'e.g. 12345678', 'required': True, 'helperText': 'Found on your game profile'},
            {'id': 'zoneId', 'label': 'Zone ID', 'placeholder': 'e.g. 2024', 'required': True, 'helperText': '4-5 digits in parentheses'}
        ],
        packages=[
            TopUpPackage(id='ml-1', name='86 Diamonds', price=49, originalPrice=55, icon='', bonus='+8 Bonus'),
            TopUpPackage(id='ml-2', name='172 Diamonds', price=95, originalPrice=110, icon='', bonus='+16 Bonus'),
            TopUpPackage(id='ml-3', name='257 Diamonds', price=145, originalPrice=165, icon='', bonus='+25 Bonus', popular=True),
            TopUpPackage(id='ml-4', name='344 Diamonds', price=190, originalPrice=220, icon='', bonus='+34 Bonus'),
            TopUpPackage(id='ml-5', name='706 Diamonds', price=380, originalPrice=440, icon='', bonus='+70 Bonus', popular=True),
            TopUpPackage(id='ml-6', name='2195 Diamonds', price=1150, originalPrice=1350, icon='', bonus='+220 Bonus'),
            TopUpPackage(id='ml-pass', name='Weekly Diamond Pass', price=69, originalPrice=85, icon='', bonus='Daily 30 Dias + Starlight Exp', popular=True)
        ],
        isActive=True
    ),
    GameProduct(
        id='ff',
        slug='free-fire',
        title='Garena Free Fire',
        subtitle='Instant Free Fire Diamond top-up with bonus diamonds',
        category='mobile',
        publisher='Garena',
        thumbnail='https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&auto=format&fit=crop&q=80',
        banner='https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80',
        badge='TOP CHOICE',
        currencyName='Diamonds',
        instantDelivery=True,
        instructionGuide='Open Free Fire, click on your nickname in the top-left corner, and copy your Player ID.',
        fields=[
            {'id': 'playerId', 'label': 'Player ID (UID)', 'placeholder': 'e.g. 987654321', 'required': True, 'helperText': '9-10 digits numeric Player ID'}
        ],
        packages=[
            TopUpPackage(id='ff-1', name='100 + 10 Diamonds', price=35, originalPrice=40, icon=''),
            TopUpPackage(id='ff-2', name='310 + 31 Diamonds', price=100, originalPrice=120, icon='', popular=True),
            TopUpPackage(id='ff-3', name='520 + 52 Diamonds', price=170, originalPrice=200, icon=''),
            TopUpPackage(id='ff-4', name='1060 + 106 Diamonds', price=340, originalPrice=400, icon='', popular=True),
            TopUpPackage(id='ff-5', name='2180 + 218 Diamonds', price=690, originalPrice=800, icon=''),
            TopUpPackage(id='ff-pass', name='Level Up Pass', price=50, originalPrice=65, icon='', bonus='Up to 800 Diamonds')
        ],
        isActive=True
    ),
    GameProduct(
        id='val',
        slug='valorant',
        title='VALORANT Points (VP)',
        subtitle='Riot Points for weapons, battle passes, and skins',
        category='pc',
        publisher='Riot Games',
        thumbnail='https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&auto=format&fit=crop&q=80',
        banner='https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&auto=format&fit=crop&q=80',
        badge='POPULAR',
        currencyName='Points',
        instantDelivery=True,
        instructionGuide='Enter your Riot ID including the tag (e.g. Jett#SEA or Player#1234).',
        fields=[
            {'id': 'riotId', 'label': 'Riot ID & Tagline', 'placeholder': 'e.g. TenZ#NA1 or Phoenix#TH1', 'required': True, 'helperText': 'Your in-game Riot ID with #'}
        ],
        packages=[
            TopUpPackage(id='val-1', name='475 VP', price=140, originalPrice=160, icon=''),
            TopUpPackage(id='val-2', name='1000 VP', price=290, originalPrice=330, icon='', popular=True),
            TopUpPackage(id='val-3', name='2050 VP', price=580, originalPrice=650, icon=''),
            TopUpPackage(id='val-4', name='3650 VP', price=1020, originalPrice=1150, icon='', popular=True),
            TopUpPackage(id='val-5', name='5350 VP', price=1480, originalPrice=1650, icon=''),
            TopUpPackage(id='val-6', name='11000 VP', price=2950, originalPrice=3300, icon='')
        ],
        isActive=True
    ),
    GameProduct(
        id='rov',
        slug='arena-of-valor',
        title='Arena of Valor (ROV)',
        subtitle='Garena RoV Voucher top-up instant delivery',
        category='mobile',
        publisher='Garena',
        thumbnail='https://images.unsplash.com/photo-1563089145-599997674d42?w=400&auto=format&fit=crop&q=80',
        banner='https://images.unsplash.com/photo-1563089145-599997674d42?w=1200&auto=format&fit=crop&q=80',
        badge='PROMO -15%',
        currencyName='Coupons',
        instantDelivery=True,
        instructionGuide='Open ROV, tap Settings -> Account -> Copy OpenID.',
        fields=[
            {'id': 'openId', 'label': 'Garena / RoV OpenID', 'placeholder': 'e.g. a87fd89b78e87498c', 'required': True, 'helperText': 'Find in Settings > Account'}
        ],
        packages=[
            TopUpPackage(id='rov-1', name='43 Coupons', price=35, originalPrice=40, icon=''),
            TopUpPackage(id='rov-2', name='128 Coupons', price=100, originalPrice=115, icon=''),
            TopUpPackage(id='rov-3', name='264 Coupons', price=200, originalPrice=230, icon='', popular=True),
            TopUpPackage(id='rov-4', name='685 Coupons', price=500, originalPrice=570, icon=''),
            TopUpPackage(id='rov-5', name='1410 Coupons', price=1000, originalPrice=1150, icon='', popular=True)
        ],
        isActive=True
    ),
    GameProduct(
        id='roblox',
        slug='roblox',
        title='Roblox (Robux & Gift Card)',
        subtitle='Official Robux balance and redeemable digital gift cards',
        category='pc',
        publisher='Roblox Corporation',
        thumbnail='https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=80',
        banner='https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
        badge='TRENDING',
        currencyName='Robux',
        instantDelivery=True,
        instructionGuide='Enter your exact Roblox username (case-sensitive).',
        fields=[
            {'id': 'username', 'label': 'Roblox Username', 'placeholder': 'e.g. Builderman99', 'required': True, 'helperText': 'Your registered Roblox account username'}
        ],
        packages=[
            TopUpPackage(id='rbx-1', name='400 Robux', price=175, originalPrice=200, icon=''),
            TopUpPackage(id='rbx-2', name='800 Robux', price=350, originalPrice=390, icon='', popular=True),
            TopUpPackage(id='rbx-3', name='1700 Robux', price=700, originalPrice=790, icon=''),
            TopUpPackage(id='rbx-4', name='4500 Robux', price=1750, originalPrice=1950, icon='', popular=True),
            TopUpPackage(id='rbx-premium', name='Roblox Premium (1 Month)', price=189, originalPrice=220, icon='', bonus='1000 Robux/mo + Trading')
        ],
        isActive=True
    ),
    GameProduct(
        id='genshin',
        slug='genshin-impact',
        title='Genshin Impact',
        subtitle='Genesis Crystals and Blessing of the Welkin Moon',
        category='mobile',
        publisher='HoYoverse',
        thumbnail='https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=400&auto=format&fit=crop&q=80',
        banner='https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=1200&auto=format&fit=crop&q=80',
        badge='INSTANT',
        currencyName='Genesis Crystals',
        instantDelivery=True,
        instructionGuide='Find your 9-digit UID at the bottom right corner of your game screen.',
        fields=[
            {'id': 'uid', 'label': 'Genshin UID', 'placeholder': 'e.g. 812345678', 'required': True, 'helperText': '9-digit UID found on bottom-right of screen'},
            {'id': 'server', 'label': 'Server Region', 'placeholder': 'Asia / America / Europe / TW,HK,MO', 'required': True, 'helperText': 'e.g. Asia Server'}
        ],
        packages=[
            TopUpPackage(id='gi-welkin', name='Blessing of the Welkin Moon', price=179, originalPrice=199, icon='', bonus='300 Genesis + 2700 Primogems', popular=True),
            TopUpPackage(id='gi-1', name='300 + 30 Genesis Crystals', price=179, originalPrice=199, icon=''),
            TopUpPackage(id='gi-2', name='980 + 110 Genesis Crystals', price=549, originalPrice=599, icon=''),
            TopUpPackage(id='gi-3', name='1980 + 260 Genesis Crystals', price=1090, originalPrice=1199, icon='', popular=True),
            TopUpPackage(id='gi-4', name='3280 + 600 Genesis Crystals', price=1790, originalPrice=1990, icon=''),
            TopUpPackage(id='gi-5', name='6480 + 1600 Genesis Crystals', price=3490, originalPrice=3890, icon='')
        ],
        isActive=True
    ),
    GameProduct(
        id='steam',
        slug='steam-wallet',
        title='Steam Wallet Code (THB / USD)',
        subtitle='Direct digital redemption code for Steam store',
        category='voucher',
        publisher='Valve',
        thumbnail='https://images.unsplash.com/photo-1612287233213-94c6fce7c01b?w=400&auto=format&fit=crop&q=80',
        banner='https://images.unsplash.com/photo-1612287233213-94c6fce7c01b?w=1200&auto=format&fit=crop&q=80',
        badge='DIGITAL CODE',
        currencyName='THB Wallet Code',
        instantDelivery=True,
        instructionGuide='Code will be instantly displayed on the order screen and sent to your email.',
        fields=[
            {'id': 'email', 'label': 'Email for Code Delivery', 'placeholder': 'you@example.com', 'required': True, 'helperText': 'Digital key will be sent here'}
        ],
        packages=[
            TopUpPackage(id='stm-1', name='Steam 100 THB Code', price=105, originalPrice=110, icon=''),
            TopUpPackage(id='stm-2', name='Steam 200 THB Code', price=210, originalPrice=220, icon=''),
            TopUpPackage(id='stm-3', name='Steam 350 THB Code', price=365, originalPrice=380, icon='', popular=True),
            TopUpPackage(id='stm-4', name='Steam 500 THB Code', price=520, originalPrice=550, icon='', popular=True),
            TopUpPackage(id='stm-5', name='Steam 1,000 THB Code', price=1030, originalPrice=1090, icon=''),
            TopUpPackage(id='stm-6', name='Steam 2,000 THB Code', price=2050, originalPrice=2150, icon='')
        ],
        isActive=True
    ),
    GameProduct(
        id='airtime',
        slug='mobile-airtime',
        title='Mobile Top-Up (AIS / True / DTAC)',
        subtitle='Prepaid phone credit and 5G high-speed internet data packs',
        category='airtime',
        publisher='Telecom Network',
        thumbnail='https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&auto=format&fit=crop&q=80',
        banner='https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80',
        badge='AIRTIME',
        currencyName='THB Credit',
        instantDelivery=True,
        instructionGuide='Select your provider and input your 10-digit mobile number.',
        fields=[
            {'id': 'phoneNumber', 'label': 'Mobile Number', 'placeholder': '08X-XXX-XXXX', 'required': True, 'helperText': '10 digits Thai mobile number'},
            {'id': 'operator', 'label': 'Network Provider', 'placeholder': 'AIS / TrueMove H / DTAC', 'required': True, 'helperText': 'Select your telecom network'}
        ],
        packages=[
            TopUpPackage(id='tel-50', name='50 THB Airtime Credit', price=50, originalPrice=50, icon=''),
            TopUpPackage(id='tel-100', name='100 THB Airtime Credit', price=100, originalPrice=100, icon='', popular=True),
            TopUpPackage(id='tel-200', name='200 THB Airtime Credit', price=200, originalPrice=200, icon=''),
            TopUpPackage(id='tel-300', name='300 THB Airtime Credit', price=300, originalPrice=300, icon=''),
            TopUpPackage(id='tel-500', name='500 THB Airtime Credit', price=500, originalPrice=500, icon='', popular=True),
            TopUpPackage(id='tel-net-unlim', name='Unlimited 5G Data (30 Days)', price=399, originalPrice=450, icon='', bonus='Max Speed + Free Calls')
        ],
        isActive=True
    )
]

# Seed Payment Methods
PAYMENT_METHODS: List[PaymentMethod] = [
    PaymentMethod(
        id='promptpay',
        name='PromptPay QR (Thai QR Payment)',
        category='qr',
        icon='',
        feePercentage=0.0,
        feeFixed=0.0,
        accountName='NEXUS TOP-UP STORE CO., LTD.',
        accountNumber='098-765-4321',
        badge='RECOMMENDED (0% Fee)'
    ),
    PaymentMethod(
        id='truemoney',
        name='TrueMoney Wallet',
        category='ewallet',
        icon='',
        feePercentage=1.5,
        feeFixed=0.0,
        accountName='NEXUS TOP-UP STORE',
        accountNumber='098-765-4321',
        badge='INSTANT'
    ),
    PaymentMethod(
        id='credit_card',
        name='Credit / Debit Card (Visa, Mastercard, JCB)',
        category='card',
        icon='',
        feePercentage=2.5,
        feeFixed=5.0,
        badge='SECURE'
    ),
    PaymentMethod(
        id='bank_transfer',
        name='Direct Bank Transfer (SCB, KBank, BBL, KTB)',
        category='bank',
        icon='',
        feePercentage=0.0,
        feeFixed=0.0,
        accountName='NEXUS DIGITAL STORE',
        accountNumber='123-4-56789-0 (Kasikorn Bank)',
        badge='SLIP VERIFY'
    )
]

# Seed Initial Orders
now = datetime.now(timezone.utc)
INITIAL_ORDERS: List[Order] = [
    Order(
        id='TOP-94821',
        createdAt=(now - timedelta(minutes=15)).isoformat(),
        updatedAt=(now - timedelta(minutes=14)).isoformat(),
        productSlug='mobile-legends',
        productTitle='Mobile Legends: Bang Bang',
        productThumbnail='https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&auto=format&fit=crop&q=80',
        packageId='ml-3',
        packageName='257 Diamonds (+25 Bonus)',
        price=145.0,
        discount=0.0,
        fee=0.0,
        total=145.0,
        currency='THB',
        inputs={'userId': '84920194', 'zoneId': '2104'},
        paymentMethodId='promptpay',
        paymentMethodName='PromptPay QR (Thai QR Payment)',
        status='completed',
        customerContact='player_legend@gmail.com',
        notes='Auto-delivered to account 84920194(2104)',
        deliveredCode='COMPLETED-DIRECT-MOONTON-REF-883921'
    ),
    Order(
        id='TOP-94822',
        createdAt=(now - timedelta(minutes=6)).isoformat(),
        updatedAt=(now - timedelta(minutes=5)).isoformat(),
        productSlug='valorant',
        productTitle='VALORANT Points (VP)',
        productThumbnail='https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&auto=format&fit=crop&q=80',
        packageId='val-2',
        packageName='1000 VP',
        price=290.0,
        discount=0.0,
        fee=0.0,
        total=290.0,
        currency='THB',
        inputs={'riotId': 'RadiantGamer#TH1'},
        paymentMethodId='promptpay',
        paymentMethodName='PromptPay QR (Thai QR Payment)',
        status='processing',
        customerContact='0812345678',
        notes='Payment received. Top-up in progress via Riot API gateway.'
    ),
    Order(
        id='TOP-94823',
        createdAt=(now - timedelta(minutes=3)).isoformat(),
        updatedAt=(now - timedelta(minutes=2)).isoformat(),
        productSlug='free-fire',
        productTitle='Garena Free Fire',
        productThumbnail='https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&auto=format&fit=crop&q=80',
        packageId='ff-2',
        packageName='310 + 31 Diamonds',
        price=100.0,
        discount=10.0,
        fee=0.0,
        total=90.0,
        currency='THB',
        inputs={'playerId': '992817263'},
        paymentMethodId='bank_transfer',
        paymentMethodName='Direct Bank Transfer',
        status='verifying_slip',
        customerContact='freefire_fan@gmail.com',
        slipImage='https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
        notes='Slip uploaded, awaiting admin confirmation.'
    )
]

class Store:
    def __init__(self):
        self.products: List[GameProduct] = list(INITIAL_PRODUCTS)
        self.payment_methods: List[PaymentMethod] = list(PAYMENT_METHODS)
        self.orders: List[Order] = list(INITIAL_ORDERS)

    def get_products(self, category: Optional[str] = None, search: Optional[str] = None) -> List[GameProduct]:
        results = [p for p in self.products if p.isActive]
        if category and category != 'all':
            results = [p for p in results if p.category == category]
        if search:
            q = search.lower()
            results = [
                p for p in results if (
                    q in p.title.lower() or 
                    q in p.publisher.lower() or 
                    q in p.currencyName.lower()
                )
            ]
        return results

    def get_product_by_slug(self, slug: str) -> Optional[GameProduct]:
        for p in self.products:
            if p.slug == slug or p.id == slug:
                return p
        return None

    def save_product(self, product: GameProduct) -> GameProduct:
        for idx, p in enumerate(self.products):
            if p.id == product.id or p.slug == product.slug:
                self.products[idx] = product
                return product
        self.products.append(product)
        return product

    def get_payment_methods(self) -> List[PaymentMethod]:
        return self.payment_methods

    def get_orders(self, query: Optional[str] = None, status: Optional[str] = None) -> List[Order]:
        orders = list(self.orders)
        if status and status != 'all':
            orders = [o for o in orders if o.status == status]
        if query:
            q = query.lower()
            orders = [
                o for o in orders if (
                    q in o.id.lower() or
                    q in o.customerContact.lower() or
                    q in o.productTitle.lower() or
                    any(q in str(v).lower() for v in o.inputs.values())
                )
            ]
        return sorted(orders, key=lambda x: x.createdAt, reverse=True)

    def get_order_by_id(self, order_id: str) -> Optional[Order]:
        for o in self.orders:
            if o.id.lower() == order_id.lower():
                return o
        return None

    def create_order(self, data: OrderCreate) -> Order:
        order_num = random.randint(10000, 99999)
        now_str = datetime.now(timezone.utc).isoformat()
        
        new_order = Order(
            id=f"TOP-{order_num}",
            createdAt=now_str,
            updatedAt=now_str,
            productSlug=data.productSlug,
            productTitle=data.productTitle or data.productSlug,
            productThumbnail=data.productThumbnail or '',
            packageId=data.packageId,
            packageName=data.packageName or 'Top-Up Package',
            price=data.price,
            discount=data.discount,
            fee=data.fee,
            total=data.total,
            currency=data.currency,
            inputs=data.inputs,
            paymentMethodId=data.paymentMethodId,
            paymentMethodName=data.paymentMethodName or data.paymentMethodId,
            status=data.status or 'pending_payment',
            slipImage=data.slipImage,
            customerContact=data.customerContact or '',
            notes=data.notes or 'Order placed via Web',
            deliveredCode=None
        )
        self.orders.insert(0, new_order)
        return new_order

    def update_order(self, order_id: str, updates: OrderUpdate) -> Optional[Order]:
        for idx, o in enumerate(self.orders):
            if o.id.lower() == order_id.lower():
                updated_dict = o.model_dump()
                if updates.status is not None:
                    updated_dict['status'] = updates.status
                if updates.slipImage is not None:
                    updated_dict['slipImage'] = updates.slipImage
                if updates.notes is not None:
                    updated_dict['notes'] = updates.notes
                if updates.deliveredCode is not None:
                    updated_dict['deliveredCode'] = updates.deliveredCode
                updated_dict['updatedAt'] = datetime.now(timezone.utc).isoformat()
                
                updated_order = Order(**updated_dict)
                self.orders[idx] = updated_order
                return updated_order
        return None

    def get_stats(self) -> DashboardStats:
        all_orders = self.get_orders()
        completed = [o for o in all_orders if o.status == 'completed']
        pending = [o for o in all_orders if o.status in ('pending_payment', 'verifying_slip', 'processing')]
        
        total_rev = sum(o.total for o in completed)
        conv_rate = round((len(completed) / len(all_orders)) * 100) if all_orders else 0
        
        return DashboardStats(
            totalRevenue=total_rev,
            totalOrders=len(all_orders),
            pendingOrders=len(pending),
            completedOrders=len(completed),
            conversionRate=conv_rate,
            recentOrders=all_orders[:8]
        )

# Singleton store
store = Store()
