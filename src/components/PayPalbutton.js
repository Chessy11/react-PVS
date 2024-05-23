import React, { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// PayPal initial options
const initialOptions = {
  "client-id": "AUKRUndUW51sm2rguWOH26Tq411OHfNnK4A_i6WCI1zMRouF74UpraxnAFcdx40emdnppa_DXPcmc9HE", // Replace with your actual client ID
  currency: "USD",
  intent: "capture",
};

const PayPalButton = () => {
  const [error, setError] = useState(null);

  const handleCreateOrder = (data, actions) => {
    const amount = "0.70"; // Default amount

    return actions.order.create({
      purchase_units: [{
        amount: {
          currency_code: "USD",
          value: amount,
        }
      }]
    }).then((orderId) => {
      if (!orderId) {
        throw new Error('Order ID not returned from PayPal.');
      }
      return orderId;
    }).catch((err) => {
      console.error("Create Order Error:", err);
      setError("An error occurred while creating the order. Please try again.");
      throw err;
    });
  };

  const handleApprove = (data, actions) => {
    return actions.order.capture().then(details => {
      alert(`Transaction completed by ${details.payer.name.given_name}`);
    }).catch((err) => {
      console.error("Order Capture Error:", err);
      setError("An error occurred while capturing the order. Please try again.");
    });
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <div className="paypal-container">
        {error && <div className="paypal-error">{error}</div>}
        <PayPalButtons
          style={{
            layout: "vertical",
            color: "gold",
            shape: "rect",
            tagline: false,
            menuPlacement: "below"
          }}
          createOrder={handleCreateOrder}
          onApprove={handleApprove}
          onError={(err) => {
            console.error("PayPal Buttons onError:", err);
            setError("An error occurred with the PayPal transaction. Please try again.");
          }}
        />
      </div>
    </PayPalScriptProvider>
  );
};

export default PayPalButton;
