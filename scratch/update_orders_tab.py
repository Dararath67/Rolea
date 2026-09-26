import os
import re

# 1. Update src/app/admin/page.tsx
file_path = 'src/app/admin/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add order delete handlers
order_handlers = """  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm(isKm ? `តើអ្នកប្រាកដជាចង់លុប Order ${orderId} នេះមែនទេ? (Delete Order)` : `Are you sure you want to delete order ${orderId}?`)) return;
    try {
      const res = await fetch(`/api/v1/admin/orders/${orderId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(isKm ? `បានលុប Order ${orderId} ដោយជោគជ័យ!` : `Order ${orderId} deleted successfully!`, 'success');
        loadData();
      } else {
        showToast(data.detail || 'Failed to delete order', 'error');
      }
    } catch (e) {
      showToast('Error deleting order', 'error');
    }
  };

  const handleClearAllOrders = async () => {
    if (!confirm(isKm ? 'តើអ្នកប្រាកដជាចង់លុបទិន្នន័យ Orders តេស្តទាំងអស់ចេញពីប្រព័ន្ធមែនទេ? (Clear all fake/test orders)' : 'Are you sure you want to clear all test orders?')) return;
    try {
      const res = await fetch('/api/v1/admin/orders/all', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(isKm ? 'បានលុបទិន្នន័យ Orders តេស្តទាំងអស់ដោយជោគជ័យ!' : 'All test orders cleared successfully!', 'success');
        loadData();
      }
    } catch (e) {
      showToast('Error clearing test orders', 'error');
    }
  };
"""

if 'handleDeleteOrder' not in content:
    content = content.replace('  const handleUpdateOrderStatus = async (orderId: string, status: string) => {', order_handlers + '\n  const handleUpdateOrderStatus = async (orderId: string, status: string) => {')

# Replace Tab 5 ORDERS
old_orders_start = "{/* TAB 5: ORDERS */}"
old_orders_end = "{/* TAB 6: USERS */}"

o_start = content.find(old_orders_start)
o_end = content.find(old_orders_end)

if o_start != -1 and o_end != -1:
    before_o = content[:o_start]
    after_o = content[o_end:]

    new_orders_tab = """{/* TAB 5: ORDERS */}
  {/* ========================================================================= */}
  {activeTab === 'orders' && (
    <div className="space-y-6">
      {/* Header, Filters & Delete All Fake Data Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1.5 border border-blue-100">
            <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
            <span>{isKm ? 'គ្រប់គ្រងការបញ្ជាទិញ & វិក្កយបត្រ' : 'Orders & Invoices Management'}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            {isKm ? 'បញ្ជីការបញ្ជាទិញ & វិក្កយបត្រ (Orders & Invoices)' : 'Orders & Payment Invoices'} ({filteredOrders.length})
          </h2>
          <p className="text-xs text-slate-500">
            {isKm ? 'ពិនិត្យមើលលេខវិក្កយបត្រ (Invoice ID), វិធីសាស្ត្រទូទាត់ (Payment Method), ស្ថានភាពប្រាក់, និងលុបទិន្នន័យតេស្ត' : 'Real-time orders, payment invoice references, payment status, and single/batch order deletion'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleClearAllOrders}
            title={isKm ? 'លុបទិន្នន័យ Orders តេស្តទាំងអស់ (Clear All Test Data)' : 'Clear All Test Orders'}
            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors border border-rose-200 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isKm ? 'លុប Fake/Test Orders ទាំងអស់' : 'Clear All Fake Orders'}</span>
          </button>

          <button
            onClick={loadData}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isKm ? 'ផ្ទុកឡើងវិញ' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'pending', 'processing', 'success', 'failed', 'refunded'].map((st) => (
          <button
            key={st}
            onClick={() => setOrderFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer ${
              orderFilter === st
                ? 'bg-blue-600 text-white shadow-xs font-black'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Orders & Invoices Table */}
      <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
              <tr>
                <th className="px-4 py-3.5">Order & Invoice ID</th>
                <th className="px-4 py-3.5">Game & Package</th>
                <th className="px-4 py-3.5">Player UID</th>
                <th className="px-4 py-3.5">Payment & Invoice</th>
                <th className="px-4 py-3.5">Provider</th>
                <th className="px-4 py-3.5">Amount</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400 font-medium">
                    {isKm ? 'មិនមានទិន្នន័យបញ្ជាទិញឡើយ (No orders found)' : 'No orders found.'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Order ID & Invoice Ref */}
                    <td className="px-4 py-3.5">
                      <button 
                        onClick={() => setSelectedOrderDetail(ord)} 
                        className="font-mono font-black text-blue-600 hover:text-blue-800 hover:underline text-sm block"
                      >
                        {ord.id}
                      </button>
                      <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono font-bold border border-slate-200">
                        <FileText className="w-3 h-3 text-slate-400" />
                        <span>Inv: {ord.reference || ord.id}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(ord.created_at).toLocaleString()}
                      </div>
                    </td>

                    {/* Game & Product */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 text-xs">{ord.game_name_en}</div>
                      <div className="text-[11px] text-blue-600 font-semibold">{ord.product_name_en}</div>
                    </td>

                    {/* Player UID */}
                    <td className="px-4 py-3.5 font-mono">
                      <div className="font-black text-slate-900">{ord.player_id}</div>
                      {ord.server_id && (
                        <div className="text-[10px] text-slate-500">Zone/Server: {ord.server_id}</div>
                      )}
                    </td>

                    {/* Payment Method & Payment Status */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-800 flex items-center gap-1 text-xs">
                        <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                        <span>{ord.payment_method_name || ord.payment_method_id || 'Bakong KHQR'}</span>
                      </div>
                      <div className="mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          ord.payment_status === 'paid' || ord.status === 'success'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : ord.payment_status === 'refunded'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {ord.payment_status === 'paid' || ord.status === 'success' 
                            ? (isKm ? 'PAID (បានទូទាត់)' : 'PAID') 
                            : (isKm ? 'UNPAID (មិនទាន់ទូទាត់)' : 'UNPAID')}
                        </span>
                      </div>
                    </td>

                    {/* Provider */}
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-[11px] font-bold text-slate-700 uppercase block">
                        {ord.provider_id || 'bay2game'}
                      </span>
                      {ord.delivery_code && (
                        <span className="text-[10px] text-slate-400 font-mono truncate max-w-[120px] block">
                          {ord.delivery_code}
                        </span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3.5">
                      <div className="font-black text-slate-900 text-sm font-mono">
                        ${ord.amount_usd.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        ៛{ord.amount_khr ? ord.amount_khr.toLocaleString() : Math.round(ord.amount_usd * 4100).toLocaleString()}
                      </div>
                    </td>

                    {/* Order Status */}
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        ord.status === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        ord.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        ord.status === 'refunded' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {ord.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {ord.status !== 'success' && ord.status !== 'refunded' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'success')}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                          >
                            Approve
                          </button>
                        )}

                        {/* View វិក្កយបត្រ / Invoice */}
                        <button
                          onClick={() => setSelectedOrderDetail(ord)}
                          className="p-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 transition-colors cursor-pointer"
                          title={isKm ? 'មើលវិក្កយបត្រ (View Invoice)' : 'Inspect Invoice'}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Single Order */}
                        <button
                          onClick={() => handleDeleteOrder(ord.id)}
                          className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200 transition-colors cursor-pointer"
                          title={isKm ? 'លុប Order នេះ (Delete Order)' : 'Delete Order'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )}

  """
    content = before_o + new_orders_tab + after_o

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Orders tab updated with invoice ID, payment details, and delete actions!')
