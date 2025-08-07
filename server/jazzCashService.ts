import crypto from 'crypto';

// JazzCash API configuration
const JAZZCASH_CONFIG = {
  merchantId: process.env.JAZZCASH_MERCHANT_ID!,
  password: process.env.JAZZCASH_PASSWORD!,
  integritySalt: process.env.JAZZCASH_INTEGRITY_SALT!,
  apiUrl: 'https://payments.jazzcash.com.pk/ApplicationAPI/API/Payment/DoTransaction',
  returnUrl: process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/api/payment/callback` : 'http://localhost:5000/api/payment/callback'
};

interface JazzCashPaymentRequest {
  merchantTransactionId: string;
  amount: number;
  phone: string;
  email: string;
  fullName: string;
}

interface JazzCashResponse {
  pp_ResponseCode: string;
  pp_ResponseMessage: string;
  pp_TxnRefNo?: string;
  pp_TxnDateTime?: string;
  pp_Amount?: string;
  pp_MerchantID?: string;
  pp_SubMerchantID?: string;
  pp_SecureHash?: string;
}

/**
 * Generate secure hash for JazzCash payment request
 * Uses HMAC SHA256 with integrity salt
 */
function generateSecureHash(params: Record<string, string>): string {
  // Sort parameters alphabetically by key
  const sortedKeys = Object.keys(params).sort();
  
  // Create data string by concatenating values in alphabetical order of keys
  const dataString = sortedKeys
    .map(key => params[key])
    .join('&');
  
  // Generate HMAC SHA256 hash
  return crypto
    .createHmac('sha256', JAZZCASH_CONFIG.integritySalt)
    .update(dataString)
    .digest('hex')
    .toUpperCase();
}

/**
 * Create JazzCash payment request
 */
export async function createJazzCashPayment(paymentData: JazzCashPaymentRequest): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Generate timestamp
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + '0000';
    
    // Prepare payment parameters
    const paymentParams = {
      pp_Version: '1.1',
      pp_TxnType: 'MWALLET',
      pp_Language: 'EN',
      pp_MerchantID: JAZZCASH_CONFIG.merchantId,
      pp_SubMerchantID: '',
      pp_Password: JAZZCASH_CONFIG.password,
      pp_BankID: 'TBANK',
      pp_ProductID: 'RETL',
      pp_TxnRefNo: paymentData.merchantTransactionId,
      pp_Amount: (paymentData.amount * 100).toString(), // Convert to paisa
      pp_TxnCurrency: 'PKR',
      pp_TxnDateTime: timestamp,
      pp_BillReference: paymentData.merchantTransactionId,
      pp_Description: `CryptoPay Investment - ${paymentData.amount} USD`,
      pp_TxnExpiryDateTime: new Date(Date.now() + 30 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + '0000', // 30 minutes
      pp_ReturnURL: JAZZCASH_CONFIG.returnUrl,
      pp_SecureHash: '',
      ppmpf_1: paymentData.phone,
      ppmpf_2: paymentData.email,
      ppmpf_3: paymentData.fullName,
      ppmpf_4: '',
      ppmpf_5: ''
    };

    // Generate secure hash
    paymentParams.pp_SecureHash = generateSecureHash(paymentParams);

    // Make request to JazzCash API
    const response = await fetch(JAZZCASH_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(paymentParams).toString()
    });

    const responseText = await response.text();
    console.log('JazzCash Response:', responseText);

    // Parse response
    let responseData: JazzCashResponse;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      // Handle non-JSON response
      const urlParams = new URLSearchParams(responseText);
      responseData = Object.fromEntries(urlParams.entries()) as unknown as JazzCashResponse;
    }

    return {
      success: responseData.pp_ResponseCode === '000',
      data: responseData
    };

  } catch (error) {
    console.error('JazzCash payment error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment processing failed'
    };
  }
}

/**
 * Verify JazzCash payment callback
 */
export function verifyJazzCashCallback(callbackData: Record<string, string>): boolean {
  try {
    const receivedHash = callbackData.pp_SecureHash;
    delete callbackData.pp_SecureHash;

    const calculatedHash = generateSecureHash(callbackData);
    
    return receivedHash === calculatedHash;
  } catch (error) {
    console.error('Hash verification error:', error);
    return false;
  }
}

/**
 * Generate unique merchant transaction ID
 */
export function generateMerchantTransactionId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `CP_${timestamp}_${random}`;
}