'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, AlertTriangle, Send, Mail } from 'lucide-react'
import { getCampaigns, createCampaign, updateCampaign, deleteCampaign, sendCampaign } from '@/lib/campaigns'
import type { Campaign, CampaignRequest } from '@/lib/types'
import CampaignModal from '@/components/CampaignModal'
import { useAlert } from '@/components/Alert'

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [ loading, setLoading] = useState(true)
    const [sending, setSending ] = useState<number | null>(null  )
    const [modal, setModal] = useState<{ open: boolean; campaign: Campaign | null }>({
        open: false,
        campaign: null ,})


    const { confirm } =  useAlert()

    useEffect( () => {
        getCampaigns()
            .then(setCampaigns)
            .finally(() => setLoading(false))
    }, [])

    async function handleSave(data : CampaignRequest, id?: number) {
        if (id) {
            const updated = await updateCampaign(id, data)
             setCampaigns(prev => prev.map(c => (c.id === id ? updated : c)))
        } else {
            const created = await createCampaign(data  )
            setCampaigns(prev => [...prev, created])
        }
        setModal({ open: false, campaign: null })
    }

    async function handleDelete(id: number) {
        await deleteCampaign(id)
        setCampaigns(prev => prev.filter(c => c.id !== id))
    }

    async function handleSend(campaign: Campaign) {
        const ok = await confirm({
            title: 'Send Campaign',
            message: `This will send "${campaign. name}" to all customers. This cannot be undone.`,
             confirmLabel: 'Send',
            cancelLabel: 'Cancel',
            variant: 'warning',
        })
        if (!ok) return

        setSending(campaign.id)
        try {
            const updated = await sendCampaign(campaign. id  )
            setCampaigns(prev => prev.map(c => (c.id === campaign.id ? updated : c)))
        } catch {
            // fix  :
            // email was sent successfully but Mailtrap rate limit caused a 500 on the response
            // refresh the list to get the real status from the server

            const fresh = await getCampaigns()
            setCampaigns(fresh)
        } finally {
            setSending(null  )
        }
    }

    const drafts = campaigns.filter(c => c.status === 'DRAFT')
    const sent = campaigns.filter(c => c.status === 'SENT')

    return (
        <div className="flex flex-col min-h-screen bg-[#f4f5f7]">

            {/* Header */}
            <div className="px-8 pt-8 pb-5">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-[22px] font-semibold text-[#1a1d20] tracking-tight">Campaigns</h1>
                        <p className="text-[12.5px] text-[#9ca3af] mt-0.5">
                            {drafts.length} draft · {sent.length} sent
                        </p>
                    </div>
                    <button
                        onClick={() => setModal({ open: true, campaign: null })}
                        className="flex items-center gap-2 px-4 py-[9px] bg-[#1a9e7f] text-white text-[13.5px] font-medium rounded-lg shadow-[0_2px_8px_rgba(26,158,127,0.3)] hover:bg-[#158a6d] active:translate-y-px transition-all"
                    >
                        <Plus size={15} strokeWidth={2.5} />
                        New Campaign
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="px-8 pb-10">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-6 h-6 border-2 border-[#1a9e7f] border-t-transparent rounded-full animate-spin" />
                            <span className="text-[13px] text-[#9ca3af]">Loading campaigns…</span>
                        </div>
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <p className="text-[14px] text-[#9ca3af]">No campaigns yet</p>
                        <p className="text-[12.5px] text-[#c4cac9] mt-1">Click "New Campaign" to create one</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">

                        {/* Drafts */}
                        {drafts.length > 0 && (
                            <div>
                                <p className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider mb-3">
                                    Drafts — {drafts.length}
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {drafts.map(campaign => (
                                        <CampaignCard
                                            key={campaign.id}
                                            campaign={campaign}
                                            sending={sending === campaign.id}
                                            onEdit={c => setModal({ open: true, campaign: c })}
                                            onDelete={handleDelete}
                                            onSend={handleSend}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sent */}
                        {sent.length > 0 && (
                            <div>
                                <p className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider mb-3">
                                    Sent — {sent.length}
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {sent.map(campaign => (
                                        <CampaignCard
                                            key={campaign.id}
                                            campaign={campaign}
                                            sending={false}
                                            onEdit={c => setModal({ open: true, campaign: c })}
                                            onDelete={handleDelete}
                                            onSend={handleSend}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </div>

            {/* Modal */}
            {modal.open && (
                <CampaignModal
                    campaign={modal.campaign}
                    onSave={handleSave}
                    onClose={() => setModal({ open: false, campaign: null })}
                />
            )}
        </div>
    )
}

// Compaign card seciton:

function CampaignCard({campaign, sending, onEdit, onDelete, onSend,}: {
    campaign:   Campaign
    sending: boolean
     onEdit: (  c: Campaign) => void
    onDelete: ( id: number) => void
    onSend  : (c: Campaign  ) => void
}) {
    const [  confirmDelete, setConfirmDelete] = useState(false)
    const  [deleting, setDeleting] = useState(false)

    const  isDraft = campaign.status === 'DRAFT'
    const isSent = campaign.  status === 'SENT'

    async function handleDelete( ) {
        setDeleting(true )
        await onDelete(campaign.id  )
    }

    function fmtDate(d: string  ) {
        return new Date(d).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        })
    }

    if (confirmDelete ) {
        return (
            <  div className="bg-white rounded-xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
                <div className="flex items-start gap-2 mb-3">
                    <AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />
                    <p className="text-[12.5px] text-[#1a1d20] font-medium leading-snug">
                        Delete &ldquo;{campaign.name}&rdquo;?
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setConfirmDelete(false)}
                        className="flex-1 py-1.5 text-[12px] font-medium text-[#6b7280] bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex-1 py-1.5 text-[12px] font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors disabled:opacity-60">
                        {deleting ? 'Deleting…' : 'Delete'}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)] hover:shadow-[0_3px_12px_rgba(0,0,0,0.11)] transition-shadow group">

            {/* Top row */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#e6f7f3] flex items-center justify-center shrink-0">
                        <Mail size={14} className="text-[#1a9e7f]" />
                    </div>
                    <p className="text-[14px] font-semibold text-[#1a1d20] leading-snug">{campaign.name}</p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {isDraft && (
                        <button
                            onClick={() => onEdit(campaign)}
                            className="p-1.5 rounded-md text-[#9ca3af] hover:text-[#1a9e7f] hover:bg-[#e6f7f3] transition-colors">
                            <Pencil size={13} />
                        </button>
                    )}
                    {isDraft && (
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="p-1.5 rounded-md text-[#9ca3af] hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 size={13} />
                           </button>
                        )}
                </div>
            </div>

            {/* subject    */}
            {campaign.subject && (
                <p className="text-[12.5px] text-[#6b7280] mb-1">{campaign.subject}</p>
            )}

            {/* Body preview */}
            {campaign.body && (
                <p className="text-[12px] text-[#9ca3af] line-clamp-2 mb-3">{campaign.body}</p>
            )}

            {/* footer */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                {/* Status badge */}
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                    isDraft
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-[#e6f7f3] text-[#1a9e7f]'}`}>
          {isDraft ? 'Draft' : `Sent ${campaign.sentAt ? fmtDate(campaign.sentAt) : ''}`}
        </span>

                {/* Send button — only for drafts */}
                {isDraft && (
                    <button
                        onClick={() => onSend(campaign)}
                        disabled={sending}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-[#1a9e7f] rounded-lg hover:bg-[#158a6d] transition-colors disabled:opacity-60">
                        <Send size={11} />
                        {sending ? 'Sending…' : 'Send'}
                    </button>
                )}
            </div>
        </div>
    )
}