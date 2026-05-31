'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { Campaign, CampaignRequest } from '@/lib/types'

const inputClass =
    'w-full px-3 py-[9px] text-[13.5px] bg-gray-50 border border-gray-200 rounded-lg text-[#1a1d20] outline-none placeholder:text-[#9ca3af] focus:border-[#1a9e7f] focus:bg-white focus:shadow-[0_0_0_3px_rgba(26,158,127,0.1)] transition-all'
const labelClass = 'block text-[12px] font-medium text-[#6b7280] mb-1.5'

 interface  Props {
     campaign: Campaign | null
    onSave : (  data: CampaignRequest, id?: number) => Promise<void >
    onClose: ( ) => void
}

export default   function CampaignModal  ({ campaign, onSave, onClose }: Props) {
    const [form, setForm] = useState<CampaignRequest>   ({
        name: campaign?.name ?? ''   ,
        subject : campaign?.subject ?? '',
        body: campaign?.body ?? '',
     } )
    const [loading, setLoading] = useState(false)
     const [  errors, setErrors] = useState<Record<string, string>>({ })

    function setField<K extends keyof CampaignRequest>(key: K, value: CampaignRequest[K]) {
        setForm  (prev => ({ ...prev, [key]: value }))
        if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }  ))
    }

    async function handleSubmit(  e: React.FormEvent) {
        e.preventDefault()
         setLoading(true)
         try {
            await onSave(form, campaign?.id)
        } catch (err: unknown) {
            const data = (err as { response?: { data?: Record<string, string> } }).response?.data
            if (data && typeof data === 'object') setErrors(data)
        } finally {
            setLoading(false)
        }
        }

         return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

            <div
                className="relative bg-white rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] w-full max-w-[480px]"
                style={{ animation: 'cardIn 0.22s cubic-bezier(0.22,1,0.36,1)' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <h2 className="text-[16px] font-semibold text-[#1a1d20]">
                        {campaign ? 'Edit Campaign' : 'New Campaign'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-[#9ca3af] hover:text-[#6b7280] hover:bg-gray-100 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
                    {/* Name */}
                    <div>
                        <label className={labelClass}>
                            Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => setField('name', e.target.value)}
                            placeholder="Summer Sale"
                            required
                            className={inputClass}
                        />
                        {errors.name && <p className="text-[11.5px] text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    {/* Subject */}
                    <div>
                        <label className={labelClass}>Subject</label>
                        <input
                            type="text"
                            value={form.subject ?? ''}
                            onChange={e => setField('subject', e.target.value)}
                            placeholder="50% off this weekend only!"
                            className={inputClass}
                        />
                    </div>

                    {/* Body */}
                    <div>
                        <label className={labelClass}>Body</label>
                        <textarea
                            value={form.body ?? ''}
                            onChange={e => setField('body', e.target.value)}
                            placeholder="Write your email content here…"
                            rows={5}
                            className={`${inputClass} resize-none`}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 text-[13.5px] font-medium text-[#6b7280] bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 text-[13.5px] font-medium text-white bg-[#1a9e7f] rounded-lg shadow-[0_2px_8px_rgba(26,158,127,0.3)] hover:bg-[#158a6d] transition-colors disabled:opacity-60"
                        >
                            {loading ? 'Saving…' : campaign ? 'Save Changes' : 'Create Campaign'}
                        </button>
                    </div>
                </form>
                </div>
        </div>
    )
}