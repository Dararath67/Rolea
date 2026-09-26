import os
import time
import httpx
from typing import Dict, Any, Optional

class TelegramService:
    @staticmethod
    def get_config() -> Dict[str, Any]:
        token = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
        chat_id = os.getenv("TELEGRAM_CHAT_ID", "").strip()
        enabled = os.getenv("TELEGRAM_ENABLED", "true").lower() in ("true", "1", "yes")
        return {
            "token": token,
            "chat_id": chat_id,
            "enabled": enabled
        }

    @staticmethod
    def send_message(text: str, token: Optional[str] = None, chat_id: Optional[str] = None, reply_markup: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        cfg = TelegramService.get_config()
        bot_token = token or cfg["token"]
        target_chat = chat_id or cfg["chat_id"]

        if not bot_token or not target_chat:
            try:
                print(f"[TELEGRAM_LOG] Message logged (Bot Token / Chat ID not set):\n{text}")
            except Exception:
                pass
            return {
                "success": True,
                "mock": True,
                "message": "Telegram message logged locally (Token or Chat ID not configured)"
            }

        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        payload: Dict[str, Any] = {
            "chat_id": target_chat,
            "text": text,
            "parse_mode": "HTML",
            "disable_web_page_preview": True
        }
        if reply_markup:
            payload["reply_markup"] = reply_markup

        try:
            r = httpx.post(url, json=payload, timeout=8.0)
            if r.status_code == 200:
                return {"success": True, "data": r.json()}
            else:
                print(f"[TELEGRAM_ERROR] HTTP {r.status_code}: {r.text}")
                return {"success": False, "error": f"HTTP {r.status_code}: {r.text}"}
        except Exception as e:
            print(f"[TELEGRAM_EXCEPTION] {e}")
            return {"success": False, "error": str(e)}

    @staticmethod
    def notify_new_order(order: Any, final_usd: float, final_khr: int, discount_info: Optional[str] = None):
        msg = (
            f"<b>[ROLEA TOPUP] NEW ORDER CREATED</b>\n"
            f"----------------------------------------\n"
            f"<b>Order ID:</b> <code>{getattr(order, 'id', 'ORD-NEW')}</code>\n"
            f"<b>Game:</b> {getattr(order, 'game_slug', 'N/A').upper()}\n"
            f"<b>Package:</b> {getattr(order, 'product_name_en', getattr(order, 'product_id', 'Package'))}\n"
            f"<b>Player UID:</b> <code>{getattr(order, 'player_id', 'N/A')}</code>\n"
        )
        if getattr(order, 'server_id', None):
            msg += f"<b>Zone/Server:</b> <code>{order.server_id}</code>\n"
        
        msg += (
            f"<b>Payment:</b> {getattr(order, 'payment_method_name', 'ABA PayWay KHQR')}\n"
            f"<b>Total:</b> ${final_usd:.2f} ({final_khr:,} KHR)\n"
        )
        if discount_info:
            msg += f"<b>Promo Code:</b> {discount_info}\n"
            
        msg += (
            f"<b>Status:</b> PENDING PAYMENT\n"
            f"<b>Time:</b> {time.strftime('%Y-%m-%d %H:%M:%S')}\n"
            f"----------------------------------------"
        )
        TelegramService.send_message(msg)

    @staticmethod
    def notify_payment_success(order: Any, tx_id: Optional[str] = None):
        amt_usd = getattr(order, 'amount_usd', 0.0)
        amt_khr = getattr(order, 'amount_khr', int(amt_usd * 4100))
        msg = (
            f"<b>[ROLEA TOPUP] PAYMENT RECEIVED (KHQR)</b>\n"
            f"----------------------------------------\n"
            f"<b>Order ID:</b> <code>{getattr(order, 'id', 'N/A')}</code>\n"
            f"<b>Transaction:</b> <code>{tx_id or 'TXN-PAID'}</code>\n"
            f"<b>Amount Paid:</b> ${amt_usd:.2f} ({amt_khr:,} KHR)\n"
            f"<b>Game:</b> {getattr(order, 'game_slug', '').upper()}\n"
            f"<b>Player UID:</b> <code>{getattr(order, 'player_id', '')}</code>\n"
            f"<b>Gateway:</b> Rothz Payment ABA PayWay\n"
            f"<b>Delivery:</b> EXECUTING VIA BAY2GAME API...\n"
            f"----------------------------------------"
        )
        TelegramService.send_message(msg)

    @staticmethod
    def deliver_customer_digital_receipt(order: Any, delivery_code: Optional[str] = None):
        """
        Sends an automated digital receipt in Khmer and English to the customer's Telegram Chat ID.
        """
        user_tg_chat_id = getattr(order, 'telegram_chat_id', None)
        if not user_tg_chat_id:
            user_id = getattr(order, 'user_id', None)
            if user_id:
                try:
                    from ..data_store import db
                    u_entry = db.get_user_entry_by_id(user_id)
                    if u_entry:
                        user_tg_chat_id = getattr(u_entry["user"], "telegram_chat_id", None)
                except Exception:
                    pass

        if not user_tg_chat_id:
            return None

        amt_usd = getattr(order, 'amount_usd', 0.0)
        amt_khr = getattr(order, 'amount_khr', int(amt_usd * 4100))
        d_code = delivery_code or getattr(order, 'delivery_code', None) or 'INSTANT-DELIVERED'
        order_id = getattr(order, 'id', 'N/A')
        game_title = getattr(order, 'game_name_en', getattr(order, 'game_slug', '')).upper()
        pkg_name = getattr(order, 'product_name_en', getattr(order, 'product_id', 'Package'))
        player_id = getattr(order, 'player_id', 'N/A')
        server_id = getattr(order, 'server_id', '')

        receipt_text = (
            f"<b>វិក្កយបត្រឌីជីថល (OFFICIAL DIGITAL RECEIPT)</b>\n"
            f"<b>RoleaTopup Cambodia Top-Up Engine</b>\n"
            f"----------------------------------------\n"
            f"<b>លេខកូដវិក្កយបត្រ (Invoice ID):</b> <code>{order_id}</code>\n"
            f"<b>ហ្គេម (Game):</b> {game_title}\n"
            f"<b>កញ្ចប់ទំនិញ (Item):</b> {pkg_name}\n"
            f"<b>Player ID:</b> <code>{player_id}</code>\n"
        )
        if server_id:
            receipt_text += f"<b>Zone/Server ID:</b> <code>{server_id}</code>\n"

        receipt_text += (
            f"<b>តម្លៃសរុប (Total Paid):</b> <code>${amt_usd:.2f}</code> ({amt_khr:,} KHR)\n"
            f"<b>កូដប្រគល់ទំនិញ (Delivery Code):</b> <code>{d_code}</code>\n"
            f"<b>ស្ថានភាព (Status):</b> SUCCESSFUL / បញ្ចូលរួចរាល់\n"
            f"<b>កាលបរិច្ឆេទ (Date):</b> {time.strftime('%Y-%m-%d %H:%M:%S')}\n"
            f"----------------------------------------\n"
            f"<i>សូមអរគុណសម្រាប់ការគាំទ្រ RoleaTopup!</i>\n"
            f"ទំនាក់ទំនង Support: @RoleaToP_bot"
        )

        try:
            return TelegramService.send_message(text=receipt_text, chat_id=str(user_tg_chat_id))
        except Exception as e:
            print(f"[TELEGRAM_WARN] Customer receipt delivery error: {e}")

    @staticmethod
    def notify_order_delivered(order: Any, delivery_code: Optional[str] = None):
        msg = (
            f"<b>[ROLEA TOPUP] ORDER COMPLETED & DELIVERED</b>\n"
            f"----------------------------------------\n"
            f"<b>Order ID:</b> <code>{getattr(order, 'id', 'N/A')}</code>\n"
            f"<b>Game:</b> {getattr(order, 'game_slug', '').upper()}\n"
            f"<b>Package:</b> {getattr(order, 'product_name_en', getattr(order, 'product_id', ''))}\n"
            f"<b>Player ID:</b> <code>{getattr(order, 'player_id', '')}</code>\n"
            f"<b>Delivery Code:</b> <code>{delivery_code or 'BAY2GAME-AUTO-DELIVERED'}</code>\n"
            f"<b>Status:</b> SUCCESS (100% Instant Delivery)\n"
            f"----------------------------------------"
        )
        TelegramService.send_message(msg)

    @staticmethod
    def notify_wallet_deposit(user_id: str, username: str, amount_usd: float, tx_id: str, new_balance: float):
        msg = (
            f"<b>[ROLEA TOPUP] WALLET DEPOSIT SUCCESS</b>\n"
            f"----------------------------------------\n"
            f"<b>User:</b> {username} (<code>{user_id}</code>)\n"
            f"<b>Deposited:</b> ${amount_usd:.2f}\n"
            f"<b>Transaction:</b> <code>{tx_id}</code>\n"
            f"<b>New Wallet Balance:</b> ${new_balance:.2f}\n"
            f"<b>Method:</b> ABA PayWay KHQR\n"
            f"----------------------------------------"
        )
        TelegramService.send_message(msg)

    @staticmethod
    def notify_provider_low_balance(provider_name: str, balance_usd: float = 0.0, threshold_usd: float = 10.0):
        msg = (
            f"<b>[ALERT] PROVIDER LOW BALANCE WARNING</b>\n"
            f"----------------------------------------\n"
            f"<b>Provider:</b> {provider_name}\n"
            f"<b>Current Balance:</b> <code>${balance_usd:.2f}</code>\n"
            f"<b>Threshold Limit:</b> ${threshold_usd:.2f}\n"
            f"<b>Status:</b> Insufficient / Low Stock Warning\n"
            f"<b>Action Required:</b> Please deposit balance to {provider_name} API account immediately to ensure automated top-up fulfillment.\n"
            f"<b>Time:</b> {time.strftime('%Y-%m-%d %H:%M:%S')}\n"
            f"----------------------------------------"
        )
        try:
            return TelegramService.send_message(msg)
        except Exception as e:
            print(f"[TELEGRAM_WARN] Failed to send provider low balance alert: {e}")

    @staticmethod
    def notify_reseller_application(user: Any):
        msg = (
            f"<b>[ROLEA TOPUP] NEW RESELLER APPLICATION</b>\n"
            f"----------------------------------------\n"
            f"<b>Username:</b> <code>{getattr(user, 'username', 'N/A')}</code>\n"
            f"<b>User ID:</b> <code>{getattr(user, 'id', 'N/A')}</code>\n"
            f"<b>Email:</b> {getattr(user, 'email', 'N/A')}\n"
            f"<b>Phone:</b> {getattr(user, 'phone', 'N/A') or 'Not provided'}\n"
            f"<b>Status:</b> PENDING ADMIN APPROVAL\n"
            f"<b>Time:</b> {time.strftime('%Y-%m-%d %H:%M:%S')}\n"
            f"----------------------------------------\n"
            f"<i>Please review this application in the Admin Portal.</i>"
        )
        TelegramService.send_message(msg)

    @staticmethod
    def notify_reseller_decision(user: Any, approved: bool, reason: Optional[str] = None):
        status_text = "APPROVED (Active Reseller)" if approved else "REJECTED"
        msg = (
            f"<b>[ROLEA TOPUP] RESELLER APPLICATION {status_text}</b>\n"
            f"----------------------------------------\n"
            f"<b>Username:</b> <code>{getattr(user, 'username', 'N/A')}</code>\n"
            f"<b>User ID:</b> <code>{getattr(user, 'id', 'N/A')}</code>\n"
            f"<b>Email:</b> {getattr(user, 'email', 'N/A')}\n"
            f"<b>Status:</b> {status_text}\n"
        )
        if not approved and reason:
            msg += f"<b>Reason:</b> {reason}\n"
        msg += (
            f"<b>Time:</b> {time.strftime('%Y-%m-%d %H:%M:%S')}\n"
            f"----------------------------------------"
        )
        TelegramService.send_message(msg)

    @staticmethod
    def notify_low_provider_balance(provider_name: str, remaining_balance: float, threshold: float = 5.0, currency: str = "USD"):
        msg = (
            f"<b>[ALERT] LOW API PROVIDER BALANCE WARNING</b>\n"
            f"----------------------------------------\n"
            f"<b>Provider:</b> {provider_name}\n"
            f"<b>Remaining Balance:</b> ${remaining_balance:.2f} {currency}\n"
            f"<b>Alert Threshold:</b> ${threshold:.2f} {currency}\n"
            f"<b>Warning:</b> Provider balance is below limit! Please top-up provider account immediately.\n"
            f"<b>Time:</b> {time.strftime('%Y-%m-%d %H:%M:%S')}\n"
            f"----------------------------------------"
        )
        TelegramService.send_message(msg)

    @staticmethod
    def get_user_profile_photo(token: str, user_id: int) -> Optional[str]:
        if not token or not user_id:
            return None
        try:
            url = f"https://api.telegram.org/bot{token}/getUserProfilePhotos"
            r = httpx.get(url, params={"user_id": user_id, "limit": 1}, timeout=4.0)
            if r.status_code == 200:
                data = r.json()
                photos = data.get("result", {}).get("photos", [])
                if photos and len(photos[0]) > 0:
                    # Choose standard resolution photo
                    target_photo = photos[0][-1] if len(photos[0]) > 1 else photos[0][0]
                    file_id = target_photo.get("file_id")
                    if file_id:
                        file_url = f"https://api.telegram.org/bot{token}/getFile"
                        fr = httpx.get(file_url, params={"file_id": file_id}, timeout=4.0)
                        if fr.status_code == 200:
                            file_path = fr.json().get("result", {}).get("file_path")
                            if file_path:
                                img_url = f"https://api.telegram.org/file/bot{token}/{file_path}"
                                img_res = httpx.get(img_url, timeout=5.0)
                                if img_res.status_code == 200 and len(img_res.content) > 0:
                                    import base64
                                    b64_data = base64.b64encode(img_res.content).decode('utf-8')
                                    mime = "image/png" if file_path.endswith('.png') else "image/jpeg"
                                    return f"data:{mime};base64,{b64_data}"
                                return img_url
        except Exception as e:
            print(f"[TELEGRAM_PHOTO_ERROR] {e}")
        return None

    @staticmethod
    def process_telegram_update(update_data: Dict[str, Any], data_store: Any) -> Dict[str, Any]:
        cfg = TelegramService.get_config()
        token = cfg.get("token")

        main_menu_keyboard = {
            "inline_keyboard": [
                [
                    {"text": "ពិនិត្យសមតុល្យ (Check Balance)", "callback_data": "cmd_balance"},
                    {"text": "ស្ថានភាព Order (Check Status)", "callback_data": "cmd_status"}
                ],
                [
                    {"text": "កូដភ្ជាប់គណនី (Link Code)", "callback_data": "cmd_link"},
                    {"text": "បង្កើត Ticket ជំនួយ (Create Ticket)", "callback_data": "cmd_ticket"}
                ]
            ]
        }

        # 1. Handle Inline Keyboard Button Click (callback_query)
        callback_query = update_data.get("callback_query")
        if callback_query:
            cb_id = callback_query.get("id")
            cb_from = callback_query.get("from", {})
            cb_msg = callback_query.get("message", {})
            cb_chat_id = str(cb_msg.get("chat", {}).get("id") or cb_from.get("id"))
            cb_data = str(callback_query.get("data") or "")

            user_id_int = cb_from.get("id")
            first_name = str(cb_from.get("first_name") or "").strip()
            last_name = str(cb_from.get("last_name") or "").strip()
            tg_username = str(cb_from.get("username") or "").strip()
            full_name = f"{first_name} {last_name}".strip() or tg_username or cb_chat_id
            display_name = full_name
            photo_url = TelegramService.get_user_profile_photo(token, user_id_int) if (token and user_id_int) else None

            if token and cb_id:
                try:
                    httpx.post(f"https://api.telegram.org/bot{token}/answerCallbackQuery", json={"callback_query_id": cb_id})
                except Exception:
                    pass

            link_code = data_store.generate_telegram_link_code(
                chat_id=cb_chat_id,
                telegram_username=tg_username,
                first_name=first_name,
                last_name=last_name,
                photo_url=photo_url
            )

            if cb_data == "cmd_link":
                reply = (
                    f"<b>[ROLEA TELEGRAM LINK CODE]</b>\n"
                    f"----------------------------------------\n"
                    f"សួស្តី <b>{display_name}</b>!\n"
                    f"កូដភ្ជាប់គណនី Telegram របស់អ្នកគឺ៖\n\n"
                    f"<b><code>{link_code}</code></b>\n\n"
                    f"សូមចម្លងកូដ 6 ខ្ទង់នេះ យកទៅវាយបញ្ចូលក្នុងគេហទំព័រត្រង់ Profile / Account Settings ដើម្បីភ្ជាប់គណនី Telegram របស់អ្នកស្វ័យប្រវត្តិ។\n"
                    f"----------------------------------------"
                )
                TelegramService.send_message(text=reply, chat_id=cb_chat_id, reply_markup=main_menu_keyboard)
                return {"ok": True, "action": "cb_link_sent"}

            elif cb_data == "cmd_balance":
                linked_user = data_store.get_user_by_telegram_chat_id(cb_chat_id, tg_username)
                if linked_user:
                    bal = float(getattr(linked_user, 'wallet_usd', 0.0))
                    uname = getattr(linked_user, 'username', 'N/A')
                    reply = (
                        f"<b>[ROLEA WALLET BALANCE]</b>\n"
                        f"----------------------------------------\n"
                        f"<b>គណនីគេហទំព័រ (Account):</b> {uname}\n"
                        f"<b>សមតុល្យកាបូបលុយ (Balance):</b> ${bal:.2f} USD (៛{int(bal * 4100):,} KHR)\n"
                        f"----------------------------------------"
                    )
                else:
                    reply = (
                        f"<b>[ROLEA WALLET BALANCE CHECK]</b>\n"
                        f"----------------------------------------\n"
                        f"លោកអ្នកមិនទាន់បានភ្ជាប់គណនី Telegram ទៅកាន់គេហទំព័រនៅឡើយទេ។\n\n"
                        f"<b>កូដភ្ជាប់គណនីរបស់អ្នកគឺ៖</b> <code>{link_code}</code>\n"
                        f"សូមចម្លងកូដនេះទៅវាយបញ្ចូលក្នុងគេហទំព័រត្រង់ Profile / Account Settings ដើម្បីភ្ជាប់គណនី និងពិនិត្យសមតុល្យស្វ័យប្រវត្តិ។\n"
                        f"----------------------------------------"
                    )
                TelegramService.send_message(text=reply, chat_id=cb_chat_id, reply_markup=main_menu_keyboard)
                return {"ok": True, "action": "cb_balance_sent"}

            elif cb_data == "cmd_status":
                linked_user = data_store.get_user_by_telegram_chat_id(cb_chat_id, tg_username)
                if linked_user:
                    user_orders = data_store.get_orders(user_id=linked_user.id)
                    if user_orders:
                        latest_orders = user_orders[-5:][::-1]
                        lines = []
                        for o in latest_orders:
                            st_clean = "SUCCESS" if o.status in ["success", "completed"] else "PENDING" if o.status == "pending" else o.status.upper()
                            g_name = getattr(o, 'game_name_en', o.game_slug).upper()
                            amt = getattr(o, 'price_usd', getattr(o, 'amount_usd', 0.0))
                            lines.append(f"• <b>{o.id}</b> | {g_name} (${amt:.2f}) -> <code>{st_clean}</code>")
                        
                        reply = (
                            f"<b>[ROLEA RECENT ORDERS - {linked_user.username}]</b>\n"
                            f"----------------------------------------\n"
                            + "\n".join(lines) + "\n"
                            f"----------------------------------------"
                        )
                    else:
                        reply = (
                            f"<b>[ROLEA ORDER STATUS]</b>\n"
                            f"----------------------------------------\n"
                            f"<b>គណនី៖</b> {linked_user.username}\n"
                            f"មិនទាន់មានប្រវត្តិ Order នៅក្នុងប្រព័ន្ធនៅឡើយទេ។\n"
                            f"----------------------------------------"
                        )
                else:
                    reply = (
                        f"<b>[ROLEA ORDER STATUS CHECK]</b>\n"
                        f"----------------------------------------\n"
                        f"សូមវាយបញ្ចូល <code>/status ORDER_ID</code> ដើម្បីពិនិត្យមើលស្ថានភាព Order\n"
                        f"ឧទាហរណ៍៖ <code>/status ORD-123456</code>\n\n"
                        f"ឬចម្លងកូដ <code>{link_code}</code> ទៅភ្ជាប់គណនីក្នុងគេហទំព័រ ដើម្បីពិនិត្យស្វ័យប្រវត្តិ។\n"
                        f"----------------------------------------"
                    )
                TelegramService.send_message(text=reply, chat_id=cb_chat_id, reply_markup=main_menu_keyboard)
                return {"ok": True, "action": "cb_status_sent"}

            elif cb_data == "cmd_ticket":
                existing_ticket = data_store.get_active_ticket_by_telegram_chat_id(cb_chat_id)
                if existing_ticket:
                    reply = (
                        f"<b>[លោកអ្នកមាន TICKET ជំនួយដែលកំពុងដំណើរការ]</b>\n"
                        f"----------------------------------------\n"
                        f"<b>Ticket ID:</b> <code>#{getattr(existing_ticket, 'reference', existing_ticket.id)}</code>\n"
                        f"សូមផ្ញើសារ ឬរូបភាពព័ត៌មានដែលត្រូវការជំនួយមកកាន់ទីនេះ ក្រុមការងារ Admin នឹងឆ្លើយតបអ្នកឆាប់ៗ។"
                    )
                else:
                    new_ticket = data_store.create_telegram_support_ticket(
                        chat_id=cb_chat_id,
                        sender_name=display_name,
                        message="[អតិថិជនបានចុចបង្កើត Support Ticket តាម Telegram Bot]",
                        telegram_username=tg_username,
                        telegram_photo_url=photo_url
                    )
                    reply = (
                        f"<b>[បានបង្កើត TICKET ជំនួយជោគជ័យ]</b>\n"
                        f"----------------------------------------\n"
                        f"<b>Ticket ID:</b> <code>#{getattr(new_ticket, 'reference', new_ticket.id)}</code>\n\n"
                        f"ជម្រាបសួរ! សួស្តី ខ្ញុំ Support Center តើមានបញ្ហាអ្វីឲ្យខ្ញុំជួយបានទេ?\n\n"
                        f"សូមផ្ញើសារ ឬរូបភាពព័ត៌មានដែលលោកអ្នកត្រូវការជំនួយមកកាន់ទីនេះ ក្រុមការងារ Admin នឹងឆ្លើយតបអ្នកនៅទីនេះឆាប់ៗ។\n"
                        f"----------------------------------------"
                    )
                TelegramService.send_message(text=reply, chat_id=cb_chat_id, reply_markup=None)
                return {"ok": True, "action": "ticket_created_via_button"}

        # 2. Handle Normal Incoming Messages
        msg = update_data.get("message") or update_data.get("edited_message") or {}
        chat_info = msg.get("chat", {})
        from_info = msg.get("from", {})
        text = msg.get("text", "").strip()

        chat_id = chat_info.get("id") or from_info.get("id")
        if not chat_id:
            return {"ok": True, "message": "No chat ID found in Telegram payload"}

        user_id_int = from_info.get("id")
        first_name = str(from_info.get("first_name") or "").strip()
        last_name = str(from_info.get("last_name") or "").strip()
        tg_username = str(from_info.get("username") or "").strip()

        full_name = f"{first_name} {last_name}".strip() or tg_username or str(chat_id)
        display_name = full_name
        str_chat_id = str(chat_id)

        photo_url = TelegramService.get_user_profile_photo(token, user_id_int) if (token and user_id_int) else None

        link_code = data_store.generate_telegram_link_code(
            chat_id=str_chat_id,
            telegram_username=tg_username,
            first_name=first_name,
            last_name=last_name,
            photo_url=photo_url
        )

        if text.startswith("/start"):
            reply = (
                f"<b>[ROLEA TOPUP SUPPORT BOT]</b>\n"
                f"----------------------------------------\n"
                f"សួស្តី <b>{display_name}</b>!\n"
                f"សូមស្វាគមន៍មកកាន់ប្រព័ន្ធ Telegram Bot របស់ RoleaTopup.\n\n"
                f"<b>កូដភ្ជាប់គណនី Telegram របស់អ្នកគឺ៖</b>\n"
                f"<b><code>{link_code}</code></b>\n"
                f"<i>(ចម្លងកូដ 6 ខ្ទង់នេះ យកទៅវាយបញ្ចូលក្នុងគេហទំព័រត្រង់ Profile Settings)</i>\n\n"
                f"សូមជ្រើសរើសមុខងារ ឬចុចប៊ូតុងខាងក្រោមដើម្បីប្រើយ៉ាងងាយស្រួល៖"
            )
            TelegramService.send_message(text=reply, chat_id=str_chat_id, reply_markup=main_menu_keyboard)
            return {"ok": True, "action": "welcome_sent"}

        if text.startswith("/link") or text.startswith("/code") or text.startswith("/connect"):
            reply = (
                f"<b>[ROLEA TELEGRAM LINK CODE]</b>\n"
                f"----------------------------------------\n"
                f"សួស្តី <b>{display_name}</b>!\n"
                f"កូដភ្ជាប់គណនី Telegram របស់អ្នកគឺ៖\n\n"
                f"<b><code>{link_code}</code></b>\n\n"
                f"សូមចម្លងកូដ 6 ខ្ទង់នេះ យកទៅវាយបញ្ចូលក្នុងគេហទំព័រត្រង់ Profile / Account Settings ដើម្បីភ្ជាប់គណនី Telegram របស់អ្នកស្វ័យប្រវត្តិ។\n"
                f"----------------------------------------"
            )
            TelegramService.send_message(text=reply, chat_id=str_chat_id, reply_markup=main_menu_keyboard)
            return {"ok": True, "link_code": link_code, "action": "code_generated"}

        if text.startswith("/help") or text.startswith("/menu"):
            reply = (
                f"<b>[ROLEA TELEGRAM BOT COMMANDS]</b>\n"
                f"----------------------------------------\n"
                f"- <code>/start</code> - ស្វាគមន៍ & ព័ត៌មានទូទៅ\n"
                f"- <code>/link</code> - បង្កើតកូដភ្ជាប់គណនី Telegram ទៅគេហទំព័រ\n"
                f"- <code>/status ORD-123456</code> - ពិនិត្យមើលស្ថានភាព Order\n"
                f"- <code>/balance username</code> - ពិនិត្យមើលសមតុល្យកាបូបលុយ Wallet\n"
                f"- <code>/ticket</code> - បង្កើត Support Ticket ជំនួយ\n"
                f"- <code>/help</code> - បង្ហាញបញ្ជី Command ទាំងអស់\n"
                f"----------------------------------------"
            )
            TelegramService.send_message(text=reply, chat_id=str_chat_id, reply_markup=main_menu_keyboard)
            return {"ok": True, "action": "help_sent"}

        if text.startswith("/status") or text.startswith("/check") or text.startswith("/track"):
            parts = text.split()
            if len(parts) > 1:
                query_id = parts[1].strip()
                order = data_store.get_order_by_id(query_id)
                if order:
                    status_text = "SUCCESS / COMPLETED" if order.status in ["success", "completed"] else "PENDING PAYMENT" if order.status == "pending" else order.status.upper()
                    reply = (
                        f"<b>[ROLEA TOPUP ORDER STATUS]</b>\n"
                        f"----------------------------------------\n"
                        f"<b>Order ID:</b> <code>{order.id}</code>\n"
                        f"<b>Game:</b> {getattr(order, 'game_name_en', order.game_slug).upper()}\n"
                        f"<b>Package:</b> {getattr(order, 'package_name_en', getattr(order, 'product_id', ''))}\n"
                        f"<b>Player UID:</b> <code>{order.player_id}</code>\n"
                        f"<b>Amount:</b> ${getattr(order, 'price_usd', getattr(order, 'amount_usd', 0.0)):.2f}\n"
                        f"<b>Status:</b> {status_text}\n"
                        f"----------------------------------------"
                    )
                else:
                    reply = f"មិនរកឃើញ Order ID: <code>{query_id}</code> នៅក្នុងប្រព័ន្ធទេ (Order ID not found)."
            else:
                linked_user = data_store.get_user_by_telegram_chat_id(str_chat_id, tg_username)
                if linked_user:
                    user_orders = data_store.get_orders(user_id=linked_user.id)
                    if user_orders:
                        latest_orders = user_orders[-5:][::-1]
                        lines = [f"• <b>{o.id}</b> | {getattr(o, 'game_name_en', o.game_slug).upper()} (${getattr(o, 'price_usd', getattr(o, 'amount_usd', 0.0)):.2f}) -> <code>{o.status.upper()}</code>" for o in latest_orders]
                        reply = (
                            f"<b>[ROLEA RECENT ORDERS - {linked_user.username}]</b>\n"
                            f"----------------------------------------\n"
                            + "\n".join(lines) + "\n"
                            f"----------------------------------------"
                        )
                    else:
                        reply = f"<b>[ROLEA ORDER STATUS]</b>\n----------------------------------------\n<b>គណនី៖</b> {linked_user.username}\nមិនទាន់មានប្រវត្តិ Order នៅក្នុងប្រព័ន្ធនៅឡើយទេ។\n----------------------------------------"
                else:
                    reply = f"សូមបញ្ចូល Order ID បន្ទាប់ពី /status (ឧទាហរណ៍៖ <code>/status ORD-123456</code>) ឬភ្ជាប់គណនីក្នុងគេហទំព័រដើម្បីមើលស្វ័យប្រវត្តិ។"
            
            TelegramService.send_message(text=reply, chat_id=str_chat_id, reply_markup=main_menu_keyboard)
            return {"ok": True, "action": "status_checked"}

        if text.startswith("/balance") or text.startswith("/wallet"):
            parts = text.split()
            username_query = parts[1].strip() if len(parts) > 1 else ""
            found_user = None
            if username_query:
                for u in getattr(data_store, 'users', []):
                    u_dict = u.get("user") if isinstance(u, dict) and "user" in u else u
                    u_name = getattr(u_dict, 'username', '') if hasattr(u_dict, 'username') else (u_dict.get('username') if isinstance(u_dict, dict) else '')
                    u_email = getattr(u_dict, 'email', '') if hasattr(u_dict, 'email') else (u_dict.get('email') if isinstance(u_dict, dict) else '')
                    if u_name.lower() == username_query.lower() or u_email.lower() == username_query.lower():
                        found_user = u_dict
                        break
            else:
                found_user = data_store.get_user_by_telegram_chat_id(str_chat_id, tg_username)
            
            if found_user:
                bal = float(getattr(found_user, 'wallet_usd', 0.0) if hasattr(found_user, 'wallet_usd') else found_user.get('wallet_usd', 0.0))
                uname = getattr(found_user, 'username', '') if hasattr(found_user, 'username') else found_user.get('username', '')
                reply = (
                    f"<b>[ROLEA WALLET BALANCE]</b>\n"
                    f"----------------------------------------\n"
                    f"<b>គណនីគេហទំព័រ (Account):</b> {uname}\n"
                    f"<b>សមតុល្យកាបូបលុយ (Balance):</b> ${bal:.2f} USD (៛{int(bal * 4100):,} KHR)\n"
                    f"----------------------------------------"
                )
            else:
                reply = (
                    f"<b>[ROLEA WALLET BALANCE CHECK]</b>\n"
                    f"----------------------------------------\n"
                    f"លោកអ្នកមិនទាន់បានភ្ជាប់គណនី Telegram ទៅកាន់គេហទំព័រនៅឡើយទេ។\n\n"
                    f"<b>កូដភ្ជាប់គណនីរបស់អ្នកគឺ៖</b> <code>{link_code}</code>\n"
                    f"សូមចម្លងកូដនេះទៅវាយបញ្ចូលក្នុងគេហទំព័រត្រង់ Profile / Account Settings ដើម្បីភ្ជាប់គណនី និងពិនិត្យសមតុល្យស្វ័យប្រវត្តិ។\n"
                    f"----------------------------------------"
                )
            TelegramService.send_message(text=reply, chat_id=str_chat_id, reply_markup=main_menu_keyboard)
            return {"ok": True, "action": "balance_checked"}

        if text.startswith("/ticket"):
            existing_ticket = data_store.get_active_ticket_by_telegram_chat_id(str_chat_id)
            if existing_ticket:
                reply = (
                    f"<b>[លោកអ្នកមាន TICKET ជំនួយដែលកំពុងដំណើរការ]</b>\n"
                    f"----------------------------------------\n"
                    f"<b>Ticket ID:</b> <code>#{getattr(existing_ticket, 'reference', existing_ticket.id)}</code>\n"
                    f"សូមផ្ញើសារ ឬរូបភាពព័ត៌មានដែលត្រូវការជំនួយមកកាន់ទីនេះ ក្រុមការងារ Admin នឹងឆ្លើយតបអ្នកឆាប់ៗ។"
                )
            else:
                new_ticket = data_store.create_telegram_support_ticket(
                    chat_id=str_chat_id,
                    sender_name=display_name,
                    message="[អតិថិជនបានបង្កើត Support Ticket]",
                    telegram_username=tg_username,
                    telegram_photo_url=photo_url
                )
                reply = (
                    f"<b>[បានបង្កើត TICKET ជំនួយជោគជ័យ]</b>\n"
                    f"----------------------------------------\n"
                    f"<b>Ticket ID:</b> <code>#{getattr(new_ticket, 'reference', new_ticket.id)}</code>\n\n"
                    f"ជម្រាបសួរ! សួស្តី ខ្ញុំ Support Center តើមានបញ្ហាអ្វីឲ្យខ្ញុំជួយបានទេ?\n\n"
                    f"សូមផ្ញើសារ ឬរូបភាពព័ត៌មានដែលលោកអ្នកត្រូវការជំនួយមកកាន់ទីនេះ ក្រុមការងារ Admin នឹងឆ្លើយតបអ្នកនៅទីនេះឆាប់ៗ។\n"
                    f"----------------------------------------"
                )
            TelegramService.send_message(text=reply, chat_id=str_chat_id, reply_markup=None)
            return {"ok": True, "action": "ticket_created"}

        if not text:
            text = "[បានផ្ញើរូបភាព ឬឯកសារ]"

        # Check for active existing ticket
        ticket = data_store.get_active_ticket_by_telegram_chat_id(str_chat_id)
        if ticket:
            # User has an open active ticket -> Append message to existing ticket
            data_store.add_ticket_reply(
                ticket_id=ticket.id,
                sender_role="user",
                sender_name=display_name,
                message=text
            )
            if photo_url and not getattr(ticket, 'telegram_photo_url', None):
                ticket.telegram_photo_url = photo_url
            if tg_username and not getattr(ticket, 'telegram_username', None):
                ticket.telegram_username = tg_username
            return {"ok": True, "ticket_id": ticket.id, "action": "message_appended"}
        else:
            # User has NO active ticket and didn't click Create Ticket -> Send menu options without auto-creating ticket!
            menu_reply = (
                f"<b>[ROLEA TOPUP BOT MENU]</b>\n"
                f"----------------------------------------\n"
                f"សួស្តី <b>{display_name}</b>!\n"
                f"<b>កូដភ្ជាប់គណនីរបស់អ្នកគឺ៖</b> <code>{link_code}</code>\n\n"
                f"ប្រសិនបើលោកអ្នកចង់បង្កើត Support Ticket ដើម្បីផ្ញើសារសាកសួរក្រុមការងារ Admin សូមចុចប៊ូតុង <b>'បង្កើត Ticket ជំនួយ'</b> ខាងក្រោម៖"
            )
            TelegramService.send_message(text=menu_reply, chat_id=str_chat_id, reply_markup=main_menu_keyboard)
            return {"ok": True, "action": "menu_presented"}

    @staticmethod
    def start_polling(data_store: Any):
        import threading
        def _poll_worker():
            last_offset = 0
            while True:
                try:
                    cfg = TelegramService.get_config()
                    token = cfg.get("token")
                    if not token:
                        time.sleep(5)
                        continue
                    url = f"https://api.telegram.org/bot{token}/getUpdates"
                    params = {"offset": last_offset, "timeout": 5}
                    r = httpx.get(url, params=params, timeout=10.0)
                    if r.status_code == 200:
                        data = r.json()
                        updates = data.get("result", [])
                        for u in updates:
                            up_id = u.get("update_id")
                            if up_id:
                                last_offset = max(last_offset, up_id + 1)
                            TelegramService.process_telegram_update(u, data_store)
                except Exception:
                    pass
                time.sleep(2)

        t = threading.Thread(target=_poll_worker, daemon=True)
        t.start()




