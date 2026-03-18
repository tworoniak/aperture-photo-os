import { useState } from 'react';
import type {
  PricingPackage,
  PricingAddOn,
  QuoteLineItem,
  Quote,
} from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
// import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DISCOUNT_CODES } from '@/lib/mock-packages';
import { Plus, Check, X, Tag, FileDown } from 'lucide-react';
// Trash2,
interface QuoteBuilderProps {
  pkg: PricingPackage;
  onExport: (quote: Quote) => void;
}

export function QuoteBuilder({ pkg, onExport }: QuoteBuilderProps) {
  const [clientName, setClientName] = useState('');
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set());
  const [customItems, setCustomItems] = useState<
    { label: string; amount: number }[]
  >([]);
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    percent: number;
  } | null>(null);
  const [discountError, setDiscountError] = useState('');
  const [notes, setNotes] = useState('');

  // ─── Calculations ────────────────────────────────────────────────────────────

  const selectedAddOnItems = pkg.addOns.filter((a) => selectedAddOns.has(a.id));
  const addOnsTotal = selectedAddOnItems.reduce((sum, a) => sum + a.price, 0);
  const customTotal = customItems.reduce((sum, i) => sum + i.amount, 0);
  const subtotal = pkg.basePrice + addOnsTotal + customTotal;
  const discountAmount = appliedDiscount
    ? Math.round((subtotal * appliedDiscount.percent) / 100)
    : 0;
  const total = subtotal - discountAmount;

  // ─── Handlers ────────────────────────────────────────────────────────────────

  function toggleAddOn(addOn: PricingAddOn) {
    setSelectedAddOns((prev) => {
      const next = new Set(prev);
      if (next.has(addOn.id)) next.delete(addOn.id);
      else next.add(addOn.id);
      return next;
    });
  }

  function addCustomItem() {
    if (!newItemLabel.trim() || !newItemAmount) return;
    setCustomItems((prev) => [
      ...prev,
      { label: newItemLabel.trim(), amount: Number(newItemAmount) },
    ]);
    setNewItemLabel('');
    setNewItemAmount('');
  }

  function removeCustomItem(idx: number) {
    setCustomItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function applyDiscount() {
    const code = discountCode.trim().toUpperCase();
    const percent = DISCOUNT_CODES[code];
    if (!percent) {
      setDiscountError('Invalid discount code');
      return;
    }
    setAppliedDiscount({ code, percent });
    setDiscountError('');
  }

  function removeDiscount() {
    setAppliedDiscount(null);
    setDiscountCode('');
  }

  function handleExport() {
    const lineItems: QuoteLineItem[] = [
      {
        id: pkg.id,
        label: `${pkg.name} — base package`,
        amount: pkg.basePrice,
        type: 'package',
      },
      ...selectedAddOnItems.map((a) => ({
        id: a.id,
        label: a.label,
        amount: a.price,
        type: 'addon' as const,
      })),
      ...customItems.map((item, i) => ({
        id: `custom-${i}`,
        label: item.label,
        amount: item.amount,
        type: 'custom' as const,
      })),
      ...(appliedDiscount
        ? [
            {
              id: 'discount',
              label: `Discount (${appliedDiscount.code} — ${appliedDiscount.percent}% off)`,
              amount: -discountAmount,
              type: 'discount' as const,
            },
          ]
        : []),
    ];

    onExport({
      id: `q${crypto.randomUUID()}`,
      clientName,
      packageId: pkg.id,
      lineItems,
      discountCode: appliedDiscount?.code,
      discountAmount,
      notes,
      createdAt: new Date().toISOString(),
    });
  }

  return (
    <div className='rounded-xl border border-border bg-card p-5 space-y-5'>
      {/* Client name */}
      <div className='space-y-1.5'>
        <label className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
          Client name
        </label>
        <Input
          placeholder='Sarah Mitchell'
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
        />
      </div>

      <Separator />

      {/* Base package */}
      <div>
        <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2'>
          Base package
        </p>
        <div className='flex items-center justify-between py-2'>
          <span className='text-sm text-foreground'>{pkg.name}</span>
          <span className='text-sm font-medium text-foreground'>
            ${pkg.basePrice.toLocaleString()}
          </span>
        </div>
      </div>

      <Separator />

      {/* Add-ons */}
      <div>
        <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3'>
          Add-ons
        </p>
        <div className='space-y-1.5'>
          {pkg.addOns.map((addOn) => {
            const selected = selectedAddOns.has(addOn.id);
            return (
              <button
                key={addOn.id}
                onClick={() => toggleAddOn(addOn)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-left text-sm transition-colors',
                  selected
                    ? 'border-foreground/30 bg-foreground/5'
                    : 'border-border hover:bg-muted/40',
                )}
              >
                <div
                  className={cn(
                    'w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors',
                    selected
                      ? 'bg-foreground border-foreground'
                      : 'border-muted-foreground/30',
                  )}
                >
                  {selected && (
                    <Check className='w-2.5 h-2.5 text-background' />
                  )}
                </div>
                <div className='flex-1 min-w-0'>
                  <span className='text-foreground'>{addOn.label}</span>
                  {addOn.description && (
                    <span className='text-xs text-muted-foreground ml-1.5'>
                      — {addOn.description}
                    </span>
                  )}
                </div>
                <span className='text-sm font-medium text-foreground shrink-0'>
                  +${addOn.price.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Custom line items */}
      <div>
        <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3'>
          Custom items
        </p>
        {customItems.length > 0 && (
          <div className='space-y-1.5 mb-3'>
            {customItems.map((item, idx) => (
              <div
                key={idx}
                className='flex items-center justify-between px-3 py-2 rounded-lg bg-muted/40'
              >
                <span className='text-sm text-foreground'>{item.label}</span>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium text-foreground'>
                    ${item.amount.toLocaleString()}
                  </span>
                  <button
                    onClick={() => removeCustomItem(idx)}
                    className='text-muted-foreground hover:text-destructive transition-colors'
                  >
                    <X className='w-3.5 h-3.5' />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className='flex gap-2'>
          <Input
            placeholder='Item label'
            value={newItemLabel}
            onChange={(e) => setNewItemLabel(e.target.value)}
            className='flex-1 text-sm'
          />
          <Input
            placeholder='$0'
            type='number'
            value={newItemAmount}
            onChange={(e) => setNewItemAmount(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomItem();
              }
            }}
            className='w-24 text-sm'
          />
          <Button variant='outline' size='icon' onClick={addCustomItem}>
            <Plus className='w-4 h-4' />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Discount code */}
      <div>
        <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3'>
          Discount code
        </p>
        {appliedDiscount ? (
          <div className='flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20'>
            <div className='flex items-center gap-2'>
              <Tag className='w-3.5 h-3.5 text-emerald-600' />
              <span className='text-sm text-emerald-700 font-medium'>
                {appliedDiscount.code} — {appliedDiscount.percent}% off
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium text-emerald-700'>
                −${discountAmount.toLocaleString()}
              </span>
              <button
                onClick={removeDiscount}
                className='text-emerald-600 hover:text-emerald-800'
              >
                <X className='w-3.5 h-3.5' />
              </button>
            </div>
          </div>
        ) : (
          <div className='space-y-1.5'>
            <div className='flex gap-2'>
              <Input
                placeholder='Enter code (e.g. WELCOME10)'
                value={discountCode}
                onChange={(e) => {
                  setDiscountCode(e.target.value);
                  setDiscountError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applyDiscount();
                  }
                }}
                className={cn('text-sm', discountError && 'border-destructive')}
              />
              <Button variant='outline' onClick={applyDiscount}>
                Apply
              </Button>
            </div>
            {discountError && (
              <p className='text-xs text-destructive'>{discountError}</p>
            )}
          </div>
        )}
      </div>

      <Separator />

      {/* Totals */}
      <div className='space-y-2'>
        <div className='flex justify-between text-sm text-muted-foreground'>
          <span>Subtotal</span>
          <span>${subtotal.toLocaleString()}</span>
        </div>
        {discountAmount > 0 && (
          <div className='flex justify-between text-sm text-emerald-600'>
            <span>Discount ({appliedDiscount?.percent}%)</span>
            <span>−${discountAmount.toLocaleString()}</span>
          </div>
        )}
        <Separator />
        <div className='flex justify-between text-base font-semibold text-foreground'>
          <span>Total</span>
          <span>${total.toLocaleString()}</span>
        </div>
      </div>

      {/* Notes */}
      <div className='space-y-1.5'>
        <label className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
          Notes for client
          <span className='font-normal ml-1'>(optional)</span>
        </label>
        <textarea
          className='w-full text-sm rounded-lg border border-border bg-background px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-foreground/20 text-foreground placeholder:text-muted-foreground'
          rows={3}
          placeholder='Any additional details or terms…'
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Export */}
      <Button
        className='w-full'
        onClick={handleExport}
        disabled={!clientName.trim()}
      >
        <FileDown className='w-4 h-4 mr-2' />
        Download quote as PDF
      </Button>
      {!clientName.trim() && (
        <p className='text-xs text-muted-foreground text-center -mt-3'>
          Enter a client name to generate the quote
        </p>
      )}
    </div>
  );
}
