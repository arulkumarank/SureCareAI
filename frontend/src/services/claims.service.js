import api from './api';

export const claimsService = {
    // ---- Hospitals & Policies ----
    async getHospitals() {
        const response = await api.get('/api/hospitals/');
        return response.data;
    },

    async searchPatients(hospitalName, query) {
        const response = await api.get(`/api/hospitals/${encodeURIComponent(hospitalName)}/patients`, {
            params: { q: query }
        });
        return response.data;
    },

    async getInsuranceCompanies() {
        const response = await api.get('/api/policies/');
        return response.data;
    },

    async getPolicies(companyName) {
        const response = await api.get(`/api/policies/${encodeURIComponent(companyName)}`);
        return response.data;
    },

    // ---- Claims (Patient view) ----
    async createClaim(claimData) {
        const response = await api.post('/api/claims/', claimData);
        return response.data;
    },

    async getUserClaims(userId) {
        const response = await api.get(`/api/claims/user/${userId}`);
        return response.data;
    },

    async getClaimDetails(claimId) {
        const response = await api.get(`/api/claims/${claimId}`);
        return response.data;
    },

    async uploadDocument(claimId, documentType, file) {
        const formData = new FormData();
        formData.append('document_type', documentType);
        formData.append('file', file);

        const response = await api.post(`/api/claims/${claimId}/documents`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    async processClaim(claimId) {
        const response = await api.post(`/api/claims/${claimId}/process`);
        return response.data;
    },

    // ---- Officer Actions ----
    async getOfficerPendingClaims() {
        const response = await api.get('/api/officer/claims');
        return response.data;
    },

    async approveClaim(claimId, data) {
        const response = await api.post(`/api/officer/claims/${claimId}/approve`, data);
        return response.data;
    },

    async rejectClaim(claimId, data) {
        const response = await api.post(`/api/officer/claims/${claimId}/reject`, data);
        return response.data;
    }
};
