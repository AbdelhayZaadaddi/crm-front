'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, AlertTriangle, Building2, Phone, Mail } from 'lucide-react'
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '@/lib/customers'
import type { Customer, CustomerRequest } from '@/lib/types'
import CustomerModal from '@/components/CustomerModal'

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const  [loading, setLoading] = useState(true)
    const [modal, setModal] = useState<{ open: boolean; customer: Customer | null }>({
        open: false,
        customer: null,
    })

    useEffect(() => {
        getCustomers()
            .then(setCustomers )
            .finally(() => setLoading(false) )
    }, [])

    async function handleSave(data: CustomerRequest, id?: number ) {
        if (id) {
            const updated = await updateCustomer(id, data )
             setCustomers ( prev => prev.map(c => (c.id === id ? updated : c)))
        } else {
            const created = await createCustomer(data)
            setCustomers (prev => [...prev, created] )
        }
        setModal({ open: false, customer: null })
    }

    async function handleDelete(id: number) {
        await deleteCustomer(id )
         setCustomers (prev => prev.filter (c => c.id !== id))
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#f4f5f7]">

            {/* Header */}
            <div className="px-8 pt-8 pb-5">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-[22px] font-semibold text-[#1a1d20] tracking-tight">Customers</h1>
                        <p className="text-[12.5px] text-[#9ca3af] mt-0.5">
                            {customers.length} total
                        </p>
                    </div>
                    <button
                        onClick={() => setModal({ open: true, customer: null })}
                        className="flex items-center gap-2 px-4 py-[9px] bg-[#1a9e7f] text-white text-[13.5px] font-medium rounded-lg shadow-[0_2px_8px_rgba(26,158,127,0.3)] hover:bg-[#158a6d] active:translate-y-px transition-all"
                    >
                        <Plus size={15} strokeWidth={2.5} />
                        New Customer
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="px-8 pb-10">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-6 h-6 border-2 border-[#1a9e7f] border-t-transparent rounded-full animate-spin" />
                            <span className="text-[13px] text-[#9ca3af]">Loading customers…</span>
                        </div>
                    </div>
                ) : customers.length === 0 ? (
                    <div  className="flex flex-col items-center justify-center h-64 text-center">
                        <p className="text-[14px] text-[#9ca3af]">No customers yet</p>
                        <p className="text-[12.5px] text-[#c4cac9] mt-1">Click "New Customer" to add one</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {customers.map(customer => (
                            <CustomerCard
                                key={customer.id}
                                customer={customer}
                                onEdit={c => setModal({ open: true, customer: c })}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {modal.open && (
                <CustomerModal
                    customer={modal.customer}
                     onSave={handleSave  }
                    onClose={() => setModal({ open: false, customer: null }    ) }
                />
            )}
        </div>
    )
}

//  card : ******

function CustomerCard  ({
                          customer,
                           onEdit,
                          onDelete   ,
                      }: {
     customer: Customer
    onEdit: (c: Customer  ) =>  void
    onDelete : ( id: number ) => void
}) {
    const  [confirmDelete, setConfirmDelete] = useState(false)
     const [ deleting, setDeleting] =  useState  (false   )

    async function handleDelete( ) {
        setDeleting(true)
         await onDelete(customer. id  )
    }

    function initials(name: string) {
        const parts = name.trim() .split(' ')
         return parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]). toUpperCase()
             : name. slice(0, 2 ).toUpperCase(  )
    }

    if ( confirmDelete) {
        return (
            <div className="bg-white rounded-xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
                <div className="flex items-start gap-2 mb-3">
                    <AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />
                    <p className="text-[12.5px] text-[#1a1d20] font-medium leading-snug">
                        Delete &ldquo;{customer.name}&rdquo;?
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setConfirmDelete(false)}
                        className="flex-1 py-1.5 text-[12px] font-medium text-[#6b7280] bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete }
                        disabled={deleting}
                        className="flex-1 py-1.5 text-[12px] font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors disabled:opacity-60"
                    >
                        {deleting ? 'Deleting…' : 'Delete'}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)] hover:shadow-[0_3px_12px_rgba(0,0,0,0.11)] transition-shadow group">
            <div className="flex items-start justify-between mb-4">
                {/* Avatar + name */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1a9e7f] flex items-center justify-center text-white text-[13px] font-bold shrink-0">
                        {initials (customer.name)}
                    </div>
                    <div>
                        <p className="text-[14px] font-semibold text-[#1a1d20]">{customer.name}</p>
                        {customer.company && (
                            <p className="text-[11.5px] text-[#9ca3af] flex items-center gap-1 mt-0.5">
                                <Building2 size={10} />
                                {customer.company}
                            </p>
                        )}
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(customer)}
                        className="p-1.5 rounded-md text-[#9ca3af] hover:text-[#1a9e7f] hover:bg-[#e6f7f3] transition-colors"
                    >
                        <Pencil size={13} />
                    </button>
                    <button
                        onClick={() => setConfirmDelete(true)}
                        className="p-1.5 rounded-md text-[#9ca3af] hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <Trash2 size={13} />
                    </button>
                </div>
            </div>

            {/* Info */}
            <div className="flex flex-col gap-1.5">
                {customer.email && (
                    <div className="flex items-center gap-2 text-[12px] text-[#6b7280]">
                        <Mail size={11} className="shrink-0 text-[#9ca3af]" />
                        {customer.email}
                    </div>
                )}
                {customer.phone && (
                    <div className="flex items-center gap-2 text-[12px] text-[#6b7280]">
                        <Phone size={11} className="shrink-0 text-[#9ca3af]" />
                        {customer.phone}
                    </div>
                )}
                {customer.notes && (
                    <p className="text-[11.5px] text-[#9ca3af] mt-1 line-clamp-2">{customer.notes }</p>
                )}
            </div>
        </div>
    )
}