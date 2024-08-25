import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa";
import { PaymentService } from "@medusajs/medusa/dist/services";

export default async function handleOrderPlaced({
  data,
  eventName,
  container,
  pluginOptions,
}: SubscriberArgs<Record<string, string>>) {
  const PaymentService: PaymentService = container.resolve("paymentservice");

  console.log("====================================");
  console.log("DATA de payment captured is", data);
  console.log("====================================");
  const { id } = data;

  const payment = await PaymentService.retrieve(id);
  console.log("payment", payment);
}

export const config: SubscriberConfig = {
  //the subscriber is listening to the CustomerService.Events.CREATED (or customer.created) event.
  event: PaymentService.Events.PAYMENT_CAPTURED,
  context: {
    subscriberId: "payment-Created-handler",
  },
};
