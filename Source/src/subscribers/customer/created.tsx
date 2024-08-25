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
import { type SubscriberConfig, type SubscriberArgs, CustomerService } from '@medusajs/medusa';
import { render } from '@react-email/render';
const nodemailer = require('nodemailer');
const MEDUSA_ADMIN_BACKEND_URL = process.env.MEDUSA_ADMIN_BACKEND_URL || 'http://localhost:9025';
const MEDUSA_SMTP_USER = process.env.MEDUSA_SMTP_USER || 'usuario';
const MEDUSA_SMTP_PASSWORD = process.env.MEDUSA_SMTP_PASSWORD || 'password';
const MEDUSA_SMTP_HOST = process.env.MEDUSA_SMTP_HOST || 'https://mail.cambia-aqui-el-host.com';
export interface CreateDataPayload {
  id: string;
  email: string;
  phone: string;
  metadata: any | null;
  last_name: string;
  created_at: string;
  deleted_at: string | null;
  first_name: string;
  updated_at: string;
  password_hash: string;
  billing_address_id: string | null;
}
export default async function handleCustomerCreated({
  data,
  eventName,
  container,
  pluginOptions,
}: SubscriberArgs<Record<string, string>>) {
  //usando smtp
  const data1 = data as unknown as CreateDataPayload;
  console.log(
    'En handle customer created',
    data1.email,

    '\n',
  );
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
    const emailHtml = render(<UserCreatedEmail data={data1} host="Ventrue Technologies" />);
    const options = {
      from: MEDUSA_SMTP_USER,
      to: `${data.email}`,
      subject: 'Usuario 2k3 Licores a Domicilio Creado',
      html: emailHtml,
    };
    try {
      const resSendMail = await transporter.sendMail(options);
      console.log('====================================');
      console.log('RESPUESTA DE SMTP', resSendMail);
      console.log('====================================');
    } catch (error) {
      console.error('ERROR:, error en transporter.sendmail', error);
    }
  } catch (error) {
    console.log('ERROR en render REACT ELEMENT');
  }
}

export const config: SubscriberConfig = {
  //the subscriber is listening to the CustomerService.Events.CREATED (or customer.created) event.
  event: CustomerService.Events.CREATED,
  context: {
    subscriberId: 'customer-created-new-handler',
  },
};
//############################################ EMAIL PART ###########################################
//written this way cuz express wont import tsx file from ts file
interface UserCreatedEmailProps {
  data: CreateDataPayload;
  host: string;
}
function UserCreatedEmail({ data, host }: UserCreatedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Bienvenido a 2k3 Licores a Domicilio</Preview>
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
              <Heading style={h1}>
                Bienvenid@ {data.first_name} {data.last_name}
              </Heading>
              <Text style={mainText}>Bienvenid@</Text>
              {/* ###################################################################### */}
              <Section style={verificationSection}>
                <Text style={verifyText}>tu cuenta ha sido creada con éxito</Text>

                <Text style={validityText}>
                  {data.billing_address_id === null
                    ? 'No olvides llenar tu información de facturación y envío'
                    : 'Verifica que tu información de facturacion y envió se encuentren correctamente ingresadas'}
                </Text>
              </Section>
            </Section>
            <Hr />
            {/* ###################################################################### */}
            <Section style={lowerSection}>
              <Text style={cautionText}>
                2k3 Licores a domicilio nunca te escribirá a pedirte que entregues o digas tu
                contraseña, tarjeta de credito o cuenta de banco.
              </Text>
            </Section>
          </Section>
          <Text style={footerText}>
            Este mensaje fue producido y distribuído por {host}. Todos los derechos reservados. 2k3
            es una marca registrada por
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
  fontSize: '36px',
  margin: '10px 0',
  textAlign: 'center' as const,
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
