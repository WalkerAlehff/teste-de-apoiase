// Infinitepay MiniApp API Types
export enum PaymentMethod {
  CREDIT = 'credit',
  DEBIT = 'debit'
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

export interface UserData {
  id: number;
  name: string;
  handle: string;
  role: string;
}

export interface TapPaymentParams {
  amount: number;        // Amount in cents
  orderNsu: string;      // Unique identifier
  installments: number;  // 1 for debit, 1-12 for credit
  paymentMethod: PaymentMethod;
}

export interface TapPaymentData {
  transactionNsu: string;
  amount: number;
  paymentMethod: string;
}

export interface CheckoutPaymentData {
  transactionNsu: string;
  receiptUrl: string;
  amount: number;
}

export interface CheckoutData {
  handle: string;        // Handle without $
  order_nsu: string;     // Unique identifier
  items: {
    quantity: number;    // Must be > 0
    price: number;       // Amount in cents
    description: string; // Item name
  }[];
  customer?: {
    name?: string;
    email?: string;
    phone_number?: string;  // Note: phone_number, not phone
  };
}

// Global window extension
declare global {
  interface Window {
    Infinitepay?: {
      getUserData(): Promise<ApiResponse<UserData>>;
      receiveTapPayment(params: TapPaymentParams): Promise<ApiResponse<TapPaymentData>>;
      sendCheckoutPayment(url: string): Promise<ApiResponse<CheckoutPaymentData>>;
    };
  }
}

// Wait for Infinitepay API injection
export const waitForInfinitepay = async (): Promise<void> => {
  let attempts = 0;
  const maxAttempts = 20; // 2 seconds max wait

  while (!window.Infinitepay && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }

  if (!window.Infinitepay) {
    throw new Error('Infinitepay API not available');
  }
};

// Get current user information
export async function getUser(): Promise<UserData> {
  await waitForInfinitepay();

  const response = await window.Infinitepay!.getUserData();

  if (response.status === 'success' && response.data) {
    return response.data;
  } else {
    throw new Error(response.message || 'Failed to get user data');
  }
}

// Process checkout payment (for contributions)
export async function processCheckoutPayment(
  items: { quantity: number; priceInReais: number; description: string }[],
  handle: string,
  customerInfo?: { name?: string; email?: string; phone?: string }
): Promise<CheckoutPaymentData> {
  await waitForInfinitepay();

  // Prepare checkout data
  const checkoutData: CheckoutData = {
    handle: handle,
    order_nsu: `CONTRIBUTION_${Date.now()}`,
    items: items.map(item => ({
      quantity: item.quantity,
      price: Math.round(item.priceInReais * 100), // Convert to cents
      description: item.description
    }))
  };

  // Add optional customer data
  if (customerInfo) {
    checkoutData.customer = {
      name: customerInfo.name,
      email: customerInfo.email,
      phone_number: customerInfo.phone
    };
  }

  // Generate checkout URL (call server)
  const response = await fetch('/api/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(checkoutData)
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout');
  }

  const { url: checkoutURL } = await response.json();

  // Process payment with MiniApp API
  const paymentResponse = await window.Infinitepay!.sendCheckoutPayment(checkoutURL);

  if (paymentResponse.status === 'success' && paymentResponse.data) {
    return paymentResponse.data;
  } else {
    throw new Error(paymentResponse.message || 'Checkout failed');
  }
}