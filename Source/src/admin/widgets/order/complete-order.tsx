import React, { useState, useEffect } from 'react';
// import { WidgetConfig } from "@medusajs/admin-shared";
import type { OrderDetailsWidgetProps, WidgetConfig } from '@medusajs/admin';
import { Button, Container, Heading } from '@medusajs/ui';
import Medusa from '@medusajs/medusa-js';
import { Order } from '@medusajs/medusa';
// import { useRouter } from "next/router";
const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'localhost:9000';
const medusa = new Medusa({ baseUrl: MEDUSA_BACKEND_URL, maxRetries: 3 });

// Important
// The widget component must be created as an arrow function.
const OrderCompleteWidget = ({ order, notify }: OrderDetailsWidgetProps) => {
  const [orden1, setOrden1] = useState<Order | null>(null);
  // const router = useRouter();
  async function CompleteOrder(orderId: string) {
    try {
      const { response, order } = await medusa.admin.orders.complete(orderId);
      if (response.status === 200) {
        alert('Orden completada con éxito');
        // router.reload();
      } else {
        alert(`Error: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error en completar orden\n', error);
    }
  }

  useEffect(() => {
    async function getOrder(orderId: string) {
      try {
        const tt = await medusa.admin.orders.retrieve(
          orderId,
          //    {
          //   expand: "Address",
          // }
        );
        if (tt.response.status === 200) {
          // console.log("Respuesta:", tt.order);
          setOrden1(tt.order);
        }
      } catch (error) {
        console.error('ERROR en get order', error);
      }
    }
    if (orden1 === null) {
      getOrder(order.id);
    }

    return () => {};
  }, []);

  return (
    <React.Fragment>
      <Container
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginBottom: 5,
          padding: 25,
        }}
      >
        <Button
          onClick={() => {
            console.log(`${orden1?.shipping_address.metadata.googleMapsLink}`);
            if (orden1?.shipping_address.metadata.latitude !== 0) {
              window.open(
                `${`https://www.google.com/maps/dir/?api=1&destination=${orden1?.shipping_address.metadata.latitude},${orden1?.shipping_address.metadata.longitude}`}`,
                '_blank',
              );
            } else {
              alert('No hay una ubicación asociada, revisa la dirección del pedido');
            }
          }}
        >
          GoogleMaps
        </Button>
        <Button
          onClick={() => {
            if (order.status !== 'completed') {
              CompleteOrder(order.id);
            } else {
              alert('Orden ya completa');
            }
          }}
          variant="secondary"
          disabled={order.status === 'completed'}
        >
          {order.status === 'completed' ? 'Orden Completa' : 'Completar Orden'}
        </Button>
      </Container>
    </React.Fragment>
  );
};

export const config: WidgetConfig = {
  zone: 'order.details.before',
};
export default OrderCompleteWidget;
