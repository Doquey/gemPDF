"use client";

import React from "react";
import { Button } from "./ui/button";
import axios from "axios";

type Props = { isPro: boolean };

const SubscriptionButton = ({ isPro }: Props) => {
  const [loading, setLoading] = React.useState(false);
  const handleSubscription = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/stripe");
      window.location.href = response.data.url;
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Button
      className="bg-blue-600 hover:bg-blue-400"
      disabled={loading}
      onClick={handleSubscription}
    >
      {isPro ? "Gerenciar Inscrições" : "Virar Pro"}
    </Button>
  );
};

export default SubscriptionButton;
