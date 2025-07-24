import axiosInstance from '@services/httpService';

export const fetchUserCredits = async () => {
    try {
        // Assuming your /sub/current/ endpoint returns the active subscription
        // which includes ai_credits_balance
        const response = await axiosInstance.get('/sub/current/');
        if (response.data && response.data.ai_credits_balance !== undefined) {
            return { 
                credits: response.data.ai_credits_balance,
                resetsOn: response.data.ai_credits_reset_date 
            };
        }
        // If no active subscription or no credits field, return 0 or handle as error
        return { credits: 0, resetsOn: null }; 
    } catch (error) {
        console.error("Error fetching user credits:", error);
        // Depending on how you want to handle this, you could re-throw or return a default/error state
        // For now, returning 0 on error so the UI doesn't break, but toast an error in component
        // throw error; // Option to re-throw for component to catch
        return { credits: 0, resetsOn: null, error: "Could not fetch credits." };
    }
};

// Service function to initiate credit purchase (STK Push for KES)
export const purchaseCreditsSTK = async (phoneNumber, amountKES) => {
    try {
        // This endpoint needs to be created on your backend.
        // It will behave similarly to the plan payment initiation.
        const response = await axiosInstance.post('/sub/payments/initiate_credit_purchase/', {
            phone_number: phoneNumber,
            amount: amountKES, // Amount in KES
            // You might need a 'description' or 'account_reference' specific to credit purchase
            transaction_desc: "AICreditTopUp", 
            // The backend will generate a MpesaPayment record with a reference to this credit purchase
        });
        return response.data; // Should return { payment_id, merchant_request_id, ... }
    } catch (error) {
        console.error("Error initiating credit purchase:", error);
        throw error; // Re-throw for the component to handle
    }
};

// Service function to poll credit purchase status (similar to plan payment polling)
export const checkCreditPurchaseStatus = async (paymentId) => {
    try {
        // This endpoint is similar to the plan payment status, but might be specific if logic differs
        const response = await axiosInstance.get(`/sub/payments/status/${paymentId}/`); // Assuming same status endpoint
        return response.data; // { status: 'SUCCESS'/'FAILED'/'CANCELLED', ... }
    } catch (error) {
        console.error("Error checking credit purchase status:", error);
        throw error;
    }
};