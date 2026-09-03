import { PaymentProviderAdapter } from './base.adapter';
import { RazorpayAdapter } from './razorpay.adapter';
import { PhonePeAdapter } from './phonepe.adapter';
import { GPayAdapter, PaytmAdapter, BankAdapter, POSAdapter } from './other.adapters';

export * from './base.adapter';
export * from './razorpay.adapter';
export * from './phonepe.adapter';
export * from './other.adapters';

export function getAdapter(providerCode: string): PaymentProviderAdapter {
  const code = providerCode.toUpperCase();
  switch (code) {
    case 'RAZORPAY':
      return new RazorpayAdapter();
    case 'PHONEPE':
      return new PhonePeAdapter();
    case 'GPAY':
      return new GPayAdapter();
    case 'PAYTM':
      return new PaytmAdapter();
    case 'BANK':
      return new BankAdapter();
    case 'POS':
      return new POSAdapter();
    default:
      throw new Error(`Unsupported payment provider adapter: ${providerCode}`);
  }
}
