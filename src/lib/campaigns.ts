import api from './axios'
import type { Campaign, CampaignRequest } from './types'

export const getCampaigns = (): Promise<Campaign[]> =>
    api.get<  Campaign[]>('/api/campaigns'). then(r => r.data )

export const createCampaign = (data: CampaignRequest): Promise<Campaign> =>
    api. post<Campaign>('/api/campaigns', data).then(r => r.data  )

export const updateCampaign = (id: number, data: CampaignRequest): Promise<Campaign> =>
    api.put <Campaign>(`/api/campaigns/${id}`, data).then(r => r.data)

export const sendCampaign = (id: number): Promise<Campaign> =>
    api.post< Campaign>(`/api/campaigns/${id}/send`).then(r => r.data)

export const deleteCampaign = (id: number): Promise<void> =>
     api.delete(`/api/campaigns/${id}`).then(() => undefined)