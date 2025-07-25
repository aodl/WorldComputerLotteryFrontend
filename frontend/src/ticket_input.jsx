import { useCallback, useEffect, useRef, useState } from 'react';

const NUM_FIELDS = 8;

const sanitise = (val) => {
  let v = val.replace(/\D/g, '');
  if (v.length > 2) v = v.slice(0, 2);
  if (parseInt(v || '0', 10) > 99) v = '99';
  return v;
};

export default function TicketInput({
  onValid,         // optional callback(numbersArray)
  initialValues,   // optional array of 8 strings/numbers
}) {
  // Store as strings (max 2 chars each) for easier cursor handling
  const [values, setValues] = useState(() =>
    Array.from({ length: NUM_FIELDS }, (_, i) =>
      sanitise(String(initialValues?.[i] ?? ''))
    )
  );
  const [warningMsg, setWarningMsg] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);

  const inputRefs = useRef(Array(NUM_FIELDS).fill(null));

  const updateState = useCallback(() => {
    const incomplete = values.some((v) => v === '');
    const duplicates = new Set(values).size !== values.length;

    if (incomplete) {
      setWarningMsg('Please enter your lottery numbers above - all are required.');
      setShowResult(false);
      return;
    }
    if (duplicates) {
      setWarningMsg('All numbers must be unique – duplicates detected.');
      setShowResult(false);
      return;
    }

    // valid
    setWarningMsg('');
    setShowResult(true);
    onValid?.(values.map((v) => Number(v)));
  }, [values, onValid]);

  // Initial validation (matching your DOMContentLoaded -> updateState())
  useEffect(() => {
    updateState();
  }, [updateState]);

  const handleInput = (idx, e) => {
    const cleaned = sanitise(e.target.value);
    setValues((prev) => {
      const next = [...prev];
      next[idx] = cleaned;
      return next;
    });

    // auto-advance
    if (cleaned.length === 2 && idx < NUM_FIELDS - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && values[idx] === '' && idx > 0) {
      const prev = inputRefs.current[idx - 1];
      if (prev) {
        e.preventDefault();
        prev.focus();
        requestAnimationFrame(() => {
          const len = prev.value.length;
          prev.setSelectionRange(len, len);
        });
      }
    }
  };

  // group blur handler (similar to focusout)
  const fieldGroupRef = useRef(null);
  const onGroupBlur = (e) => {
    // if focus leaves the whole group, validate again
    if (!fieldGroupRef.current?.contains(e.relatedTarget)) {
      updateState();
    }
  };

  const ticketRef = values.map((v) => v.padStart(2, '0')).join('');

  const handleCopy = async () => {
    if (!ticketRef) return;
    try {
      await navigator.clipboard.writeText(ticketRef);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      alert('Unable to copy – please copy manually.');
    }
  };

  return (
    <div className="mega">
      <div className="mega-inner">
        <div>
          <h3>Get Started</h3>
          <p>TODO, better instructions... Enter your chosen lottery numbers. This will produce a ticket reference which you can paste into the memo of a transaction to the <a href="https://dashboard.internetcomputer.org/account/b2f9bc1fc7ee9151715a04c0933b03d49042f9b1ec1d064e3a2e46f804825d33" target="_blank">World Computer Lottery smart contract ledger account (b2f9bc1fc7ee9151715a04c0933b03d49042f9b1ec1d064e3a2e46f804825d33)</a>. Tickets cost 0.01 ICP. All tickets will be entered into the draw, and winning tickets will receive their share of the jackpot. Note that the NNS dapp will soon support memos.</p>
        </div>

        <div id="eight-input-component">
          {/* Inline numeric inputs */}
          <div
            className="field-group"
            id="fieldGroup"
            ref={fieldGroupRef}
            onBlur={onGroupBlur}
          >
            {Array.from({ length: NUM_FIELDS }).map((_, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                className="numeric"
                type="text"
                inputMode="numeric"
                maxLength={2}
                aria-label={`Number ${i + 1}`}
                value={values[i]}
                onInput={(e) => handleInput(i, e)}
                onKeyDown={(e) => handleKeyDown(i, e)}
              />
            ))}
          </div>

          <p className="warning" id="warning" style={{ display: warningMsg ? 'block' : 'none' }}>
            {warningMsg}
          </p>

          <div
            className="result-card"
            id="resultCard"
            style={{ display: showResult ? 'flex' : 'none' }}
          >
            Ticket Ref.&nbsp;
            <span id="result">{ticketRef}</span>
            <button
              type="button"
              className="copy-btn"
              id="copyBtn"
              aria-label="Copy result to clipboard"
              onClick={handleCopy}
              disabled={copied}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

