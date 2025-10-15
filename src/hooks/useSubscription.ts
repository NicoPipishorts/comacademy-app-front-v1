import { useEffect, useState } from 'react';
import type { Product, ProductSubscription } from 'react-native-iap';
import { IAPService } from '../services/iap.service';
import { UseAuth } from '@/auth/AuthContext';

type SubscriptionProduct = Product | ProductSubscription;

export const useSubscription = () => {
  const { session } = UseAuth();
  const [products, setProducts] = useState<SubscriptionProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const init = async () => {
      try {
        await IAPService.initialize();

        // Setup purchase listener
        cleanup = IAPService.setupPurchaseListener(
          (purchase) => {
            console.log('Purchase successful:', purchase);
            checkSubscription();
            setPurchasing(false);
          },
          (err) => {
            console.error('Purchase error:', err);
            setError(err.message || 'Purchase failed');
            setPurchasing(false);
          }
        );

        // Load products and subscription status
        const [availableProducts, currentSub] = await Promise.all([
          IAPService.getProducts(),
          IAPService.checkSubscriptionStatus(),
        ]);

        setProducts(availableProducts);
        setSubscription(currentSub);
      } catch (err: any) {
        console.error('Failed to initialize IAP:', err);
        setError(err.message || 'Failed to initialize purchases');
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      cleanup?.();
      IAPService.endConnection();
    };
  }, []);

  const purchase = async (productId: string) => {
    try {
      setPurchasing(true);
      setError(null);
      await IAPService.purchaseSubscription(
        productId,
        session?.user?.id ? String(session.user.id) : undefined
      );
    } catch (err: any) {
      console.error('Purchase error:', err);
      setError(err.message || 'Purchase failed');
      setPurchasing(false);
    }
  };

  const restore = async () => {
    try {
      setLoading(true);
      setError(null);
      await IAPService.restorePurchases();
      await checkSubscription();
    } catch (err: any) {
      console.error('Restore error:', err);
      setError(err.message || 'Restore failed');
    } finally {
      setLoading(false);
    }
  };

  const checkSubscription = async () => {
    try {
      const currentSub = await IAPService.checkSubscriptionStatus();
      setSubscription(currentSub);
      return currentSub;
    } catch (err: any) {
      console.error('Check subscription error:', err);
      return null;
    }
  };

  return {
    products,
    subscription,
    loading,
    purchasing,
    error,
    purchase,
    restore,
    checkSubscription,
    hasActiveSubscription: !!subscription,
  };
};
