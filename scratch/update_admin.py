import os

file_path = 'src/app/admin/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Tab 6 USERS
old_tab_start = '{/* TAB 6: USERS */}'
old_tab_end = '{/* TAB 7: RESELLERS & B2B'

start_idx = content.find(old_tab_start)
end_idx = content.find(old_tab_end)

if start_idx != -1 and end_idx != -1:
    before = content[:start_idx]
    after = content[end_idx:]
    
    new_users_tab = """{/* TAB 6: USERS */}
  {/* ========================================================================= */}
  {activeTab === 'users' && (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1.5 border border-blue-100">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>{isKm ? 'គ្រប់គ្រងគណនីអតិថិជន & ពាក្យសម្ងាត់' : 'User Accounts & Credentials'}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            {isKm ? 'គណនីអតិថិជនទាំងអស់' : 'Customer Accounts'} ({users.length})
          </h2>
          <p className="text-xs text-slate-500">
            {isKm ? 'ពិនិត្យមើលឈ្មោះគណនី, អ៊ីមែល, ពាក្យសម្ងាត់, និងសមតុល្យកាបូបលុយរបស់ User នីមួយៗ' : 'Manage registered accounts, view plain passwords, emails, and wallet balances'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isKm ? 'ស្វែងរក Username, Email, ID...' : 'Search username, email, ID...'}
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <button
            onClick={loadData}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isKm ? 'ផ្ទុកឡើងវិញ' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
              <tr>
                <th className="px-4 py-3.5">User & Account ID</th>
                <th className="px-4 py-3.5">Email Address</th>
                <th className="px-4 py-3.5">Password</th>
                <th className="px-4 py-3.5">Phone</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Wallet Balance</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users
                .filter((u) => {
                  if (!userSearchQuery) return true;
                  const q = userSearchQuery.toLowerCase();
                  return (
                    (u.username && u.username.toLowerCase().includes(q)) ||
                    (u.email && u.email.toLowerCase().includes(q)) ||
                    (u.id && u.id.toLowerCase().includes(q)) ||
                    (u.phone && u.phone.toLowerCase().includes(q)) ||
                    (u.role && u.role.toLowerCase().includes(q))
                  );
                })
                .map((u) => {
                  const isPassVisible = !!visiblePasswords[u.id];
                  const plainPass = u.password_plain || 'admin123';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* User & ID */}
                      <td className="px-4 py-3.5">
                        <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                          <span>{u.username}</span>
                        </div>
                        <div className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-mono font-bold">
                          <span>ID:</span>
                          <span>{u.id}</span>
                        </div>
                      </td>

                      {/* Email Address */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="font-bold text-slate-800 text-xs select-all">{u.email}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(u.email, `email-${u.id}`)}
                            title="Copy Email"
                            className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            {copiedField === `email-${u.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Password */}
                      <td className="px-4 py-3.5">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
                          <KeyRound className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="font-mono font-bold text-xs text-slate-900 tracking-wider select-all">
                            {isPassVisible ? plainPass : '••••••••••••'}
                          </span>
                          
                          {/* Toggle View Password */}
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(u.id)}
                            title={isPassVisible ? 'Hide Password' : 'Show Password'}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors ml-1 cursor-pointer"
                          >
                            {isPassVisible ? (
                              <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                            ) : (
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                            )}
                          </button>

                          {/* Copy Password */}
                          <button
                            type="button"
                            onClick={() => copyToClipboard(plainPass, `pass-${u.id}`)}
                            title="Copy Password"
                            className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            {copiedField === `pass-${u.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3.5 font-mono text-slate-600 font-medium">
                        {u.phone || '-'}
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          u.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : u.role === 'reseller'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      {/* Wallet Balance */}
                      <td className="px-4 py-3.5">
                        <div className="font-mono font-black text-slate-900 text-sm">
                          ${(u.wallet_usd || 0).toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {((u.wallet_usd || 0) * 4100).toLocaleString()} KHR
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => { setAdjustUserId(u.id); setAdjustAmount('50'); }}
                            className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 text-xs font-bold transition-colors border border-blue-200 flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{isKm ? 'ដាក់លុយ' : 'Funds'}</span>
                          </button>

                          <button
                            onClick={() => { setResetPasswordUser(u); setResetPasswordValue('RoleaPass123!'); }}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-600 hover:text-white text-slate-700 text-xs font-bold transition-colors border border-slate-200 flex items-center gap-1 cursor-pointer"
                          >
                            <Key className="w-3.5 h-3.5" />
                            <span>{isKm ? 'ដូរលេខកូដ' : 'Reset'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )}

  """
    content = before + new_users_tab + after

# Add Reset Password Modal
reset_modal = """  {/* Reset Password Modal */}
  {resetPasswordUser && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">{isKm ? 'កំណត់ពាក្យសម្ងាត់ថ្មី' : 'Reset User Password'}</h3>
              <p className="text-[11px] text-slate-500 font-mono">{resetPasswordUser.username} ({resetPasswordUser.email})</p>
            </div>
          </div>
          <button onClick={() => setResetPasswordUser(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">{isKm ? 'ពាក្យសម្ងាត់ថ្មី (New Password)' : 'New Password'}</label>
            <div className="relative">
              <input
                type="text"
                required
                value={resetPasswordValue}
                onChange={(e) => setResetPasswordValue(e.target.value)}
                placeholder="e.g. SecurePass123!"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 pr-16"
              />
              <button
                type="button"
                onClick={() => setResetPasswordValue('Pass' + Math.floor(100000 + Math.random() * 900000) + '!')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-200 hover:bg-slate-300 text-[10px] font-bold rounded-lg text-slate-700"
              >
                Gen
              </button>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800">
            <strong>{isKm ? 'ចំណាំ:' : 'Note:'}</strong> {isKm ? 'ពាក្យសម្ងាត់ថ្មីនេះនឹងត្រូវកំណត់ជូន User ភ្លាមៗ' : 'The user will be able to log in with this new password immediately.'}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setResetPasswordUser(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
            >
              {isKm ? 'បោះបង់' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isResettingPassword}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{isResettingPassword ? (isKm ? 'កំពុងផ្លាស់ប្តូរ...' : 'Saving...') : (isKm ? 'រក្សាទុក' : 'Update Password')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )}
"""

if '{/* Reset Password Modal */}' not in content:
    content = content.replace('{/* Adjust Funds Modal */}', reset_modal + '\n  {/* Adjust Funds Modal */}')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Admin page updated successfully')
