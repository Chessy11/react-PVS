import React, { useState, useEffect, useRef } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PayPalButton = () => {
  const [error, setError] = useState(null);
  const [isCreditCardFormVisible, setIsCreditCardFormVisible] = useState(false);
  const paypalContainerRef = useRef(null);

  // Example function that toggles the visibility state
  // You'll need to call this when the credit card form is triggered
  const toggleCreditCardFormVisibility = () => {
    setIsCreditCardFormVisible(true);  // Set to false when form is closed
  };

  const handleCreateOrder = (data, actions) => {
    const amount = "1.20"; // Default amount
    return actions.order.create({
      purchase_units: [{
        amount: {
          currency_code: "USD",
          value: amount,
        }
      }]
    });
  };

  const handleApprove = (data, actions) => {
    return actions.order.capture().then(details => {
      alert(`Transaction completed by ${details.payer.name.given_name}`);
    }).catch(err => {
      console.error("Order Capture Error:", err);
      setError("An error occurred while capturing the order. Please try again.");
    });
  };

  const handleOnError = (err) => {
    console.error("PayPal Buttons onError:", err);
    setError("An error occurred with the PayPal transaction. Please try again.");
  };

  const handleOnRendered = () => {
    if (paypalContainerRef.current) {
      paypalContainerRef.current.scrollIntoView({behavior: 'smooth', block: 'nearest'});
    }
  };

  return (
    <PayPalScriptProvider options={{"client-id": "your-client-id", currency: "USD", intent: "capture"}}>
      <div ref={paypalContainerRef} className={`paypal-container ${isCreditCardFormVisible ? 'credit-card-visible' : ''}`}>
        {error && <div className="paypal-error">{error}</div>}
        <PayPalButtons
          style={{ layout: "vertical" }}
          createOrder={handleCreateOrder}
          onApprove={handleApprove}
          onError={handleOnError}
          onRendered={handleOnRendered}
        />
      </div>
    </PayPalScriptProvider>
  );
};

export default PayPalButton;
