import { useState } from 'react';
import { isAddress, type Address } from 'viem';
import { useAccount } from 'wagmi';
import { contractAbi } from '../config/contract';
import { useProtocol } from '../hooks/useProtocol';
import { useTx } from '../hooks/useTx';
import { TxStatus } from './TxStatus';
import { shortAddress } from '../lib/format';

/**
 * Panel de administración. Solo se muestra al owner de CustomDEX (o al pendingOwner,
 * para que pueda aceptar la propiedad). Ownable2Step: transferir la propiedad son dos pasos,
 * transferOwnership(nuevo) por el owner actual y acceptOwnership() por el nuevo owner.
 */
export function AdminPanel({ contractAddress }: { contractAddress: Address }) {
  const { address } = useAccount();
  const { feeBps, maxFeeBps, feeRecipient, owner, pendingOwner } = useProtocol(contractAddress);

  const [feePct, setFeePct] = useState('');
  const [recipient, setRecipient] = useState('');
  const [newOwner, setNewOwner] = useState('');

  const feeTx = useTx();
  const recipientTx = useTx();
  const ownerTx = useTx();
  const acceptTx = useTx();

  const me = address?.toLowerCase();
  const isOwner = Boolean(me && owner && me === owner.toLowerCase());
  const isPendingOwner = Boolean(me && pendingOwner && me === pendingOwner.toLowerCase());
  if (!isOwner && !isPendingOwner) return null;

  const base = { address: contractAddress, abi: contractAbi } as const;

  // Comisión: el usuario escribe un % (p. ej. 0.5) y el contrato espera basis points (50)
  const newFeeBps = feePct === '' ? undefined : Math.round(Number(feePct) * 100);
  const feeValid =
    newFeeBps !== undefined && Number.isFinite(newFeeBps) && newFeeBps >= 0 &&
    maxFeeBps !== undefined && BigInt(newFeeBps) <= maxFeeBps;

  return (
    <div className="card">
      <h2>
        Admin
        <span className="badge">{isOwner ? 'Owner' : 'Pending owner'}</span>
      </h2>

      <div className="details" style={{ marginTop: 0 }}>
        <div className="row">
          <span className="label">Comisión actual</span>
          <span className="value">
            {feeBps !== undefined ? `${Number(feeBps) / 100}% (${feeBps} bps)` : '—'} · máx.{' '}
            {maxFeeBps !== undefined ? `${Number(maxFeeBps) / 100}%` : '—'}
          </span>
        </div>
        <div className="row">
          <span className="label">Receptor de comisiones</span>
          <span className="value mono-sm" title={feeRecipient}>{feeRecipient ? shortAddress(feeRecipient) : '—'}</span>
        </div>
        <div className="row">
          <span className="label">Owner</span>
          <span className="value mono-sm" title={owner}>{owner ? shortAddress(owner) : '—'}</span>
        </div>
        {pendingOwner && pendingOwner !== '0x0000000000000000000000000000000000000000' && (
          <div className="row">
            <span className="label">Pending owner</span>
            <span className="value mono-sm" title={pendingOwner}>{shortAddress(pendingOwner)}</span>
          </div>
        )}
      </div>

      {isPendingOwner && (
        <>
          <p className="hint" style={{ marginTop: 16 }}>
            El owner actual te ha propuesto como nuevo owner. Acepta para completar la transferencia.
          </p>
          <button
            className="action full"
            disabled={acceptTx.isBusy}
            onClick={() => {
              acceptTx.reset();
              acceptTx.writeContract({ ...base, functionName: 'acceptOwnership' });
            }}
          >
            {acceptTx.isSending ? 'Confirma en la wallet…' : acceptTx.isConfirming ? 'Confirmando…' : 'acceptOwnership()'}
          </button>
          <TxStatus tx={acceptTx} label="acceptOwnership" />
        </>
      )}

      {isOwner && (
        <>
          <h4 className="admin-sub">Comisión del protocolo</h4>
          <div className="form-row">
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder={`Nueva comisión en % (máx. ${maxFeeBps !== undefined ? Number(maxFeeBps) / 100 : '…'})`}
              value={feePct}
              onChange={(e) => setFeePct(e.target.value)}
            />
            <button
              className="action"
              disabled={feeTx.isBusy || !feeValid}
              onClick={() => {
                feeTx.reset();
                feeTx.writeContract({ ...base, functionName: 'setFeeBps', args: [BigInt(newFeeBps!)] });
              }}
            >
              {feeTx.isSending ? 'Confirma…' : feeTx.isConfirming ? 'Confirmando…' : 'setFeeBps()'}
            </button>
          </div>
          {feePct !== '' && !feeValid && <p className="status error">Comisión no válida o por encima del máximo.</p>}
          <TxStatus tx={feeTx} label="setFeeBps" />

          <h4 className="admin-sub">Receptor de comisiones</h4>
          <div className="form-row">
            <input type="text" placeholder="0x…" value={recipient} onChange={(e) => setRecipient(e.target.value.trim())} />
            <button
              className="action"
              disabled={recipientTx.isBusy || !isAddress(recipient)}
              onClick={() => {
                recipientTx.reset();
                recipientTx.writeContract({ ...base, functionName: 'setFeeRecipient', args: [recipient as Address] });
              }}
            >
              {recipientTx.isSending ? 'Confirma…' : recipientTx.isConfirming ? 'Confirmando…' : 'setFeeRecipient()'}
            </button>
          </div>
          {recipient !== '' && !isAddress(recipient) && <p className="status error">Dirección no válida.</p>}
          <TxStatus tx={recipientTx} label="setFeeRecipient" />

          <h4 className="admin-sub">Transferir propiedad (2 pasos)</h4>
          <div className="form-row">
            <input type="text" placeholder="Nuevo owner 0x…" value={newOwner} onChange={(e) => setNewOwner(e.target.value.trim())} />
            <button
              className="action danger"
              disabled={ownerTx.isBusy || !isAddress(newOwner)}
              onClick={() => {
                ownerTx.reset();
                ownerTx.writeContract({ ...base, functionName: 'transferOwnership', args: [newOwner as Address] });
              }}
            >
              {ownerTx.isSending ? 'Confirma…' : ownerTx.isConfirming ? 'Confirmando…' : 'transferOwnership()'}
            </button>
          </div>
          <p className="hint" style={{ marginTop: 8 }}>
            Sigues siendo owner hasta que la nueva dirección llame a <code>acceptOwnership()</code> (verá
            este panel al conectarse).
          </p>
          <TxStatus tx={ownerTx} label="transferOwnership" />
        </>
      )}
    </div>
  );
}
