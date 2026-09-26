import os
import re

file_path = 'src/app/admin/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update lucide-react imports if Minus is missing
if 'Minus,' not in content:
    content = content.replace('  CheckCheck,\n', '  CheckCheck,\n  Minus,\n')

# 2. Update state variables
if 'const [adjustMode,' not in content:
    state_pattern = "const [adjustUserId, setAdjustUserId] = useState<string | null>(null);"
    replacement_state = """const [adjustUser, setAdjustUser] = useState<any | null>(null);
  const [adjustMode, setAdjustMode] = useState<'add' | 'deduct' | 'set' | 'clear'>('add');
  const [adjustUserId, setAdjustUserId] = useState<string | null>(null);"""
    content = content.replace(state_pattern, replacement_state)

# 3. Update handleAdjustBalance function
old_handler = """  const handleAdjustBalance = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!adjustUserId) return;
  try {
  await fetch('/api/v1/admin/users/' + adjustUserId + '/adjust-balance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount_usd: parseFloat(adjustAmount) || 0, reason: adjustReason })
  });
  setAdjustUserId(null);
  showToast('Wallet balance adjusted successfully', 'success');
  loadData();
  } catch (err) {
  showToast('Failed to adjust balance', 'error');
  }
  };"""

new_handler = """  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = adjustUser?.id || adjustUserId;
    if (!targetId) return;
    
    const amt = parseFloat(adjustAmount) || 0;
    try {
      const res = await fetch(`/api/v1/admin/users/${targetId}/adjust-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount_usd: amt, 
          mode: adjustMode, 
          reason: adjustReason || (adjustMode === 'add' ? 'Admin Added Funds' : adjustMode === 'deduct' ? 'Admin Deducted Funds' : 'Admin Balance Adjustment')
        })
      });
      const data = await res.json();
      if (data.success) {
        const msg = adjustMode === 'add' 
          ? (isKm ? `បានបញ្ចូលទឹកប្រាក់ $${amt.toFixed(2)} ដោយជោគជ័យ!` : `Successfully added $${amt.toFixed(2)} to wallet!`)
          : adjustMode === 'deduct'
          ? (isKm ? `បានកាត់ទឹកប្រាក់ $${amt.toFixed(2)} ដោយជោគជ័យ!` : `Successfully deducted $${amt.toFixed(2)} from wallet!`)
          : adjustMode === 'clear'
          ? (isKm ? 'បានលុបសមតុល្យកាបូបលុយទៅ $0.00 រួចរាល់!' : 'Successfully cleared wallet balance to $0.00!')
          : (isKm ? `បានកំណត់សមតុល្យ $${amt.toFixed(2)} រួចរាល់!` : `Successfully set wallet balance to $${amt.toFixed(2)}!`);
        
        showToast(msg, 'success');
        setAdjustUser(null);
        setAdjustUserId(null);
        loadData();
      } else {
        showToast(data.detail || 'Failed to adjust balance', 'error');
      }
    } catch (err) {
      showToast('Error adjusting wallet balance', 'error');
    }
  };"""

if old_handler in content:
    content = content.replace(old_handler, new_handler)
else:
    # Try flexible replacement
    content = re.sub(
        r'const handleAdjustBalance = async \(e: React\.FormEvent\) => \{[\s\S]*?loadData\(\);[\s\S]*?\}\s*catch[^\}]*\}[\s\S]*?\};',
        new_handler,
        content
    )

# 4. Update the Action Buttons in Tab 6 USERS Table
old_action_buttons = """                          <button
                            onClick={() => { setAdjustUserId(u.id); setAdjustAmount('50'); }}
                            className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 text-xs font-bold transition-colors border border-blue-200 flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{isKm ? 'ដាក់លុយ' : 'Funds'}</span>
                          </button>"""

new_action_buttons = """                          {/* Add Funds Button */}
                          <button
                            onClick={() => {
                              setAdjustUser(u);
                              setAdjustUserId(u.id);
                              setAdjustMode('add');
                              setAdjustAmount('50');
                              setAdjustReason('Admin deposit credit');
                            }}
                            title={isKm ? 'បន្ថែមលុយចូលកាបូប (+ Add Funds)' : 'Add Funds to Wallet'}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 text-xs font-bold transition-colors border border-emerald-200 flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 text-emerald-600 group-hover:text-white" />
                            <span>{isKm ? '+ ដាក់លុយ' : '+ Add'}</span>
                          </button>

                          {/* Delete / Deduct Funds Button */}
                          <button
                            onClick={() => {
                              setAdjustUser(u);
                              setAdjustUserId(u.id);
                              setAdjustMode('deduct');
                              setAdjustAmount('10');
                              setAdjustReason('Admin balance deduction');
                            }}
                            title={isKm ? 'កាត់លុយ / លុបលុយពីកាបូប (- Deduct Funds)' : 'Deduct / Delete Funds from Wallet'}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 text-xs font-bold transition-colors border border-rose-200 flex items-center gap-1 cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5 text-rose-600 group-hover:text-white" />
                            <span>{isKm ? '- កាត់លុយ' : '- Deduct'}</span>
                          </button>"""

if old_action_buttons in content:
    content = content.replace(old_action_buttons, new_action_buttons)

# 5. Update Adjust Funds Modal with Tabbed Add / Deduct / Set / Clear UI
old_modal_start = '{/* Adjust Funds Modal */}'
old_modal_end = '{/* Product Pricing Override Modal */}'

m_start = content.find(old_modal_start)
m_end = content.find(old_modal_end)

if m_start != -1 and m_end != -1:
    before_m = content[:m_start]
    after_m = content[m_end:]
    
    new_funds_modal = """{/* Adjust Funds Modal (Add Fund & Delete/Deduct Fund) */}
  {(adjustUser || adjustUserId) && (() => {
    const currentTarget = adjustUser || users.find(u => u.id === adjustUserId) || { id: adjustUserId, username: 'User', wallet_usd: 0 };
    const curBal = Number(currentTarget.wallet_usd || 0);
    const amtNum = parseFloat(adjustAmount) || 0;
    
    let calcNewBal = curBal;
    if (adjustMode === 'add') calcNewBal = curBal + amtNum;
    else if (adjustMode === 'deduct') calcNewBal = Math.max(0, curBal - amtNum);
    else if (adjustMode === 'set') calcNewBal = Math.max(0, amtNum);
    else if (adjustMode === 'clear') calcNewBal = 0.0;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className={`p-2.5 rounded-2xl ${
                adjustMode === 'add' 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                  : adjustMode === 'deduct' 
                  ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                  : 'bg-blue-50 text-blue-600 border border-blue-200'
              }`}>
                {adjustMode === 'add' ? (
                  <Plus className="w-5 h-5" />
                ) : adjustMode === 'deduct' ? (
                  <Minus className="w-5 h-5" />
                ) : (
                  <Coins className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {adjustMode === 'add' 
                    ? (isKm ? 'បញ្ចូលលុយក្នុងកាបូប (Add Funds)' : 'Add Funds to Wallet') 
                    : adjustMode === 'deduct' 
                    ? (isKm ? 'កាត់លុយពីកាបូប (Deduct Funds)' : 'Deduct Funds from Wallet') 
                    : adjustMode === 'clear'
                    ? (isKm ? 'លុបលុយទាំងអស់ (Clear Balance)' : 'Clear All Wallet Funds')
                    : (isKm ? 'កំណត់សមតុល្យជាក់លាក់ (Set Balance)' : 'Set Exact Balance')}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  {currentTarget.username} <span className="font-mono text-slate-400">({currentTarget.email || currentTarget.id})</span>
                </p>
              </div>
            </div>
            <button 
              onClick={() => { setAdjustUser(null); setAdjustUserId(null); }} 
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-center text-xs font-bold">
            <button
              type="button"
              onClick={() => { setAdjustMode('add'); setAdjustReason('Admin deposit credit'); }}
              className={`py-2 px-1.5 rounded-xl transition-all cursor-pointer ${
                adjustMode === 'add'
                  ? 'bg-emerald-600 text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              + {isKm ? 'ដាក់លុយ' : 'Add'}
            </button>
            <button
              type="button"
              onClick={() => { setAdjustMode('deduct'); setAdjustReason('Admin balance deduction'); }}
              className={`py-2 px-1.5 rounded-xl transition-all cursor-pointer ${
                adjustMode === 'deduct'
                  ? 'bg-rose-600 text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              - {isKm ? 'កាត់លុយ' : 'Deduct'}
            </button>
            <button
              type="button"
              onClick={() => { setAdjustMode('set'); setAdjustReason('Admin set balance'); }}
              className={`py-2 px-1.5 rounded-xl transition-all cursor-pointer ${
                adjustMode === 'set'
                  ? 'bg-blue-600 text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              = {isKm ? 'កំណត់' : 'Set'}
            </button>
            <button
              type="button"
              onClick={() => { setAdjustMode('clear'); setAdjustAmount('0'); setAdjustReason('Admin cleared balance to $0.00'); }}
              className={`py-2 px-1.5 rounded-xl transition-all cursor-pointer ${
                adjustMode === 'clear'
                  ? 'bg-slate-900 text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              0$ {isKm ? 'លុបអស់' : 'Clear'}
            </button>
          </div>

          {/* Current vs New Balance Live Calculation Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">{isKm ? 'សមតុល្យបច្ចុប្បន្ន:' : 'Current Balance:'}</span>
              <span className="font-mono font-bold text-slate-800">${curBal.toFixed(2)} USD</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                {adjustMode === 'add' 
                  ? (isKm ? 'ទឹកប្រាក់បន្ថែម (+):' : 'Amount to Add (+):') 
                  : adjustMode === 'deduct' 
                  ? (isKm ? 'ទឹកប្រាក់កាត់ចេញ (-):' : 'Amount to Deduct (-):')
                  : adjustMode === 'clear'
                  ? (isKm ? 'លុបទាំងអស់:' : 'Clear to zero:')
                  : (isKm ? 'កំណត់ទៅ:' : 'Set exact balance to:')}
              </span>
              <span className={`font-mono font-black ${
                adjustMode === 'add' ? 'text-emerald-600' : adjustMode === 'deduct' ? 'text-rose-600' : 'text-blue-600'
              }`}>
                {adjustMode === 'add' ? `+$${amtNum.toFixed(2)}` : adjustMode === 'deduct' ? `-$${amtNum.toFixed(2)}` : `$${amtNum.toFixed(2)}`}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-black text-slate-900">{isKm ? 'សមតុល្យថ្មីបន្ទាប់ពីកែប្រែ:' : 'New Resulting Balance:'}</span>
              <span className={`font-mono font-black text-base ${
                calcNewBal > curBal ? 'text-emerald-600' : calcNewBal < curBal ? 'text-rose-600' : 'text-slate-900'
              }`}>
                ${calcNewBal.toFixed(2)} USD
              </span>
            </div>
          </div>

          <form onSubmit={handleAdjustBalance} className="space-y-4 text-xs">
            {adjustMode !== 'clear' && (
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  {adjustMode === 'add' 
                    ? (isKm ? 'ចំនួនទឹកប្រាក់ដែលត្រូវបន្ថែម (USD)' : 'Amount to Add (USD)') 
                    : adjustMode === 'deduct' 
                    ? (isKm ? 'ចំនួនទឹកប្រាក់ដែលត្រូវកាត់ (USD)' : 'Amount to Deduct (USD)') 
                    : (isKm ? 'សមតុល្យថ្មីដែលត្រូវកំណត់ (USD)' : 'New Target Balance (USD)')}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-black text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-black text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {(adjustMode === 'add' ? [5, 10, 20, 50, 100, 500] : [1, 5, 10, 20, 50, 100]).map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAdjustAmount(amt.toString())}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        parseFloat(adjustAmount) === amt
                          ? adjustMode === 'add'
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-rose-600 text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {adjustMode === 'add' ? `+$${amt}` : `-$${amt}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                {isKm ? 'មូលហេតុ / កំណត់ចំណាំ (Reason / Note)' : 'Reason / Note'}
              </label>
              <input
                type="text"
                required
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="e.g. Deposit correction, Loyalty bonus..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setAdjustUser(null); setAdjustUserId(null); }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors"
              >
                {isKm ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                type="submit"
                className={`px-5 py-2.5 rounded-xl text-white font-black shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
                  adjustMode === 'add'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : adjustMode === 'deduct'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : adjustMode === 'clear'
                    ? 'bg-slate-900 hover:bg-black'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {adjustMode === 'add' ? (
                  <Plus className="w-4 h-4" />
                ) : adjustMode === 'deduct' ? (
                  <Minus className="w-4 h-4" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>
                  {adjustMode === 'add'
                    ? (isKm ? `បញ្ជាក់ដាក់លុយ +$${amtNum.toFixed(2)}` : `Confirm +$${amtNum.toFixed(2)} Credit`)
                    : adjustMode === 'deduct'
                    ? (isKm ? `បញ្ជាក់កាត់លុយ -$${amtNum.toFixed(2)}` : `Confirm -$${amtNum.toFixed(2)} Deduction`)
                    : adjustMode === 'clear'
                    ? (isKm ? 'បញ្ជាក់លុបលុយទាំងអស់ ($0.00)' : 'Confirm Clear Balance to $0.00')
                    : (isKm ? `បញ្ជាក់កំណត់សមតុល្យ $${amtNum.toFixed(2)}` : `Confirm Set Balance to $${amtNum.toFixed(2)}`)}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  })()}
"""
    content = before_m + new_funds_modal + '\n  ' + after_m

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Wallet funds add/deduct UI updated successfully!')
