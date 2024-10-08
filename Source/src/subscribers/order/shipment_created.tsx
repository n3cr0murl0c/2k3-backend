import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import React from 'react';
import {
  type SubscriberConfig,
  type SubscriberArgs,
  CustomerService,
  OrderService,
  Order,
} from '@medusajs/medusa';
import { render } from '@react-email/render';
const nodemailer = require('nodemailer');
const MEDUSA_ADMIN_BACKEND_URL = process.env.MEDUSA_ADMIN_BACKEND_URL || 'http://localhost:9025';
const MEDUSA_SMTP_USER = process.env.MEDUSA_SMTP_USER || 'usuario';
const MEDUSA_SMTP_PASSWORD = process.env.MEDUSA_SMTP_PASSWORD || 'password';
const MEDUSA_SMTP_HOST = process.env.MEDUSA_SMTP_HOST || 'https://mail.cambia-aqui-el-host.com';
export interface DataPayload {
  id: string;
  email: string;
  token: string;
  last_name: string;
  first_name: string;
}
export default async function handleOrderPlaced({
  data,
  eventName,
  container,
  pluginOptions,
}: SubscriberArgs<Record<string, string>>) {
  const data1 = data as unknown as DataPayload;
  console.log(
    'En handle order.envio-creado',
    '\n',
    data,
    '\n',

    '\n',
  );
  if (data.no_notification) {
    //do nothing
  } else {
    //obtener el mail en base al id de orden
    const orderService: OrderService = container.resolve('orderService');
    const order: Order = await orderService.retrieve(data.id);

    const transporter = nodemailer.createTransport({
      host: MEDUSA_SMTP_HOST,
      port: 465,
      secure: true,
      auth: {
        user: MEDUSA_SMTP_USER,
        pass: MEDUSA_SMTP_PASSWORD,
      },
    });
    try {
      const emailHtml = render(<ShipmentCreatedEmail mail={data1.email} order={order} />);
      const options = {
        from: MEDUSA_SMTP_USER,
        to: `${order.email}`,
        subject: `Tú Orden ${data.id} ha sido enviada`,
        html: emailHtml,
      };
      try {
        const resSendMail = await transporter.sendMail(options);
        console.log('====================================');
        console.log('RESPUESTA SMTP de Envpio orden enviada', resSendMail);
        console.log('====================================');
      } catch (error) {
        console.error('ERROR:, error en transporter.sendmail', error);
      }
    } catch (error) {
      console.log('ERROR en render REACT ELEMENT');
    }
  }
}

export const config: SubscriberConfig = {
  event: OrderService.Events.SHIPMENT_CREATED,
  context: {
    subscriberId: 'order-shipment-created-handler',
  },
};
//############################################ EMAIL PART ###########################################
interface ShipmentCreatedEmailProps {
  order: Order;
  mail: string;
}
function ShipmentCreatedEmail({ order, mail }: ShipmentCreatedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Su orden ha sido enviada...</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={coverSection}>
            <Section style={imageSection}>
              <Img
                src={`${MEDUSA_ADMIN_BACKEND_URL}/uploads/2k3-logo.png`}
                width="75"
                height="45"
                alt="2k3 Logo"
              />
            </Section>
            <Section style={upperSection}>
              <Heading style={h1}>Su orden ha sido enviada...</Heading>
              {order.items.map((item, index) => {
                return (
                  <>
                    <Text style={mainText}>{item.title}</Text>
                    <Text style={mainText}>{item.unit_price}</Text>
                  </>
                );
              })}
              <Section style={verificationSection}>
                <Text style={verifyText}></Text>
              </Section>
            </Section>
            <Hr />
            <Section style={lowerSection}>
              <Text style={cautionText}>
                2k3 Licores a Domicilio nunca te envíara correos a pedir que envíes o verifiques tu
                contraseña, tarjeta de credito o número de cuenta.
              </Text>
            </Section>
          </Section>
          <Text style={footerText}>
            Este mensaje fue producido y distribuído por Ventrue Technologies. Todos los derechos
            reservados. 2k3 es una marca registrada por
            <Link href="https://ventruetechnologies.com" target="_blank" style={link}>
              ventruetechnologies.com
            </Link>
            , Inc. Revisa nuestra{' '}
            <Link
              href="https://ventruetechnologies.com/politica-privacidad"
              target="_blank"
              style={link}
            >
              politica de privacidad
            </Link>
            .
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#fff',
  color: '#212121',
};

const container = {
  padding: '20px',
  margin: '0 auto',
  backgroundColor: '#eee',
};

const h1 = {
  color: '#333',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '20px',
  fontWeight: 'bold',
  marginBottom: '15px',
};

const link = {
  color: '#2754C5',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '14px',
  textDecoration: 'underline',
};

const text = {
  color: '#333',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '14px',
  margin: '24px 0',
};

const imageSection = {
  backgroundColor: '#252f3d',
  display: 'flex',
  padding: '20px 0',
  alignItems: 'center',
  justifyContent: 'center',
};

const coverSection = { backgroundColor: '#fff' };

const upperSection = { padding: '25px 35px' };

const lowerSection = { padding: '25px 35px' };

const footerText = {
  ...text,
  fontSize: '12px',
  padding: '0 20px',
};

const verifyText = {
  ...text,
  margin: 0,
  fontWeight: 'bold',
  textAlign: 'center' as const,
};

const codeText = {
  ...text,
  fontWeight: 'bold',
  fontSize: '10px',
  margin: '10px 0',
  textAlign: 'center' as const,
  maxWidth: '350px',
};

const validityText = {
  ...text,
  margin: '0px',
  textAlign: 'center' as const,
};

const verificationSection = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const mainText = { ...text, marginBottom: '14px' };

const cautionText = { ...text, margin: '0px' };
