import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
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
  UserService,
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
  const { id } = data; //Solo retorna el ID el payload
  //usando smtp
  try {
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
      console.log(
        'En handle order placed',
        data,
        '\n',
        MEDUSA_SMTP_HOST,
        MEDUSA_SMTP_USER,
        MEDUSA_SMTP_PASSWORD,
      );
      const orderService: OrderService = container.resolve('orderService');
      const userService: UserService = container.resolve('userService');
      try {
        const order = await orderService.retrieve(id, {
          relations: ['customer', 'items', 'items.variant', 'shipping_address'],
        });

        // console.log("ORden obtenida con exito", order);
        if (order !== null && order !== undefined) {
          const emailHtml = render(<OrderPlacedEmail order={order} />);
          try {
            const options = {
              from: MEDUSA_SMTP_USER,
              to: `${order.email}`,
              subject: 'Orden Creada Exitosamente',
              html: emailHtml,
            };
            const resSendMail = await transporter.sendMail(options);
            console.log('====================================');
            console.log('RESPUESTA DE SMTP order.placed', resSendMail);
            console.log('CORREO ENVIADO A USUARIO');
            console.log('====================================');
            try {
              const userList = await userService.list();
              userList?.map(async (user, index) => {
                if (user.role === 'admin') {
                  const options2 = {
                    from: MEDUSA_SMTP_USER,
                    to: `${user.email}`,
                    subject: 'Se ha recibido una nueva orden',
                    html: emailHtml,
                  };
                  const resSendMail2 = await transporter.sendMail(options2);
                  console.log('====================================');
                  console.log('RESPUESTA DE SMTP order.placed', resSendMail2);
                  console.log('CORREO ENVIADO A ADMIN:', `${user.first_name} ${user.last_name}`);
                  console.log('====================================');
                }
              });
            } catch (error) {}
          } catch (error) {
            console.error('ERROR:, error en transporter.sendmail', error);
          }
        } else {
          console.log('orden nulla', order);
        }
      } catch (error) {
        console.log('ERROR en render REACT ELEMENT', error);
      }
    } catch (error) {
      console.error('ERROR en obtener servicio de orden', error);
    }
  } catch (error) {
    console.error('Error en create transport for smtp nodemailer');
  }
}

export const config: SubscriberConfig = {
  //the subscriber is listening to the CustomerService.Events.CREATED (or customer.created) event.
  event: OrderService.Events.PLACED,
  context: {
    subscriberId: 'order-placed-handler',
  },
};
//############################################ EMAIL PART ###########################################
//written this way cuz express wont import tsx file from ts file
interface OrderPlacedEmailProps {
  order: Order;
}

const OrderPlacedEmail = ({ order }: OrderPlacedEmailProps) => (
  <Html>
    <Head />
    <Preview>Recibo de tu Compra</Preview>

    <Body style={main}>
      <Container style={container}>
        <Section>
          <Row>
            <Column>
              <Img
                src={`${MEDUSA_ADMIN_BACKEND_URL}/uploads/icon1.png`}
                width="42"
                height="42"
                alt="2k3Logo"
              />
            </Column>

            <Column align="right" style={tableCell}>
              <Text style={heading}>Recibo</Text>
            </Column>
          </Row>
        </Section>

        <Section style={informationTable}>
          <Row style={informationTableRow}>
            <Column colSpan={2}>
              <Section>
                <Row>
                  <Column style={informationTableColumn}>
                    <Text style={informationTableLabel}>Usuario</Text>
                    <Link
                      style={{
                        ...informationTableValue,
                        color: '#15c',
                        textDecoration: 'underline',
                      }}
                    >
                      {order.email}
                    </Link>
                  </Column>
                </Row>

                <Row>
                  <Column style={informationTableColumn}>
                    <Text style={informationTableLabel}>FECHA DE RECIBO</Text>
                    <Text style={informationTableValue}>
                      {order.updated_at.toLocaleDateString()}
                    </Text>
                  </Column>
                </Row>

                <Row>
                  <Column style={informationTableColumn}>
                    <Text style={informationTableLabel}>ORDEN ID</Text>
                    <Link
                      style={{
                        ...informationTableValue,
                        color: '#15c',
                        textDecoration: 'underline',
                      }}
                    >
                      {order.id}
                    </Link>
                  </Column>
                  <Column style={informationTableColumn}>
                    <Text style={informationTableLabel}>Nro. DOCUMENTO.</Text>
                    <Text style={informationTableValue}>999999999999</Text>
                  </Column>
                </Row>
              </Section>
            </Column>
            <Column style={informationTableColumn} colSpan={2}>
              <Text style={informationTableLabel}>FACTURADO A:</Text>
              <Text style={informationTableValue}>Efectivo</Text>
              <Text
                style={informationTableValue}
              >{`${order.customer.first_name} ${order.customer.last_name}`}</Text>
              <Text style={informationTableValue}>{`${order.shipping_address.address_1}`}</Text>
              <Text style={informationTableValue}>{`${
                order.shipping_address.city !== '' && order.shipping_address.city !== null
                  ? order.shipping_address.city
                  : 'Guaranda'
              }, ${
                order.shipping_address.province !== null
                  ? order.shipping_address.province
                  : 'Bolívar'
              }`}</Text>
              <Text style={informationTableValue}>{`Ecuador`}</Text>
            </Column>
          </Row>
        </Section>
        <Section style={productTitleTable}>
          <Text style={productsTitle}>Productos</Text>
        </Section>
        <Section>
          {order.items.map((product, idex) => {
            return (
              <Row key={idex}>
                <Column style={{ width: '64px' }}>
                  <Img
                    src={`${MEDUSA_ADMIN_BACKEND_URL}/uploads/${JSON.stringify(product.thumbnail)
                      .split('/')[4]
                      ?.slice(0, -1)}`}
                    width="64"
                    height="64"
                    alt="producto"
                    style={productIcon}
                  />
                </Column>
                <Column style={{ paddingLeft: '22px' }}>
                  <Text style={productTitle}>{product.title}</Text>
                  <Text style={productDescription}>{product.description}</Text>
                  <Text style={productDescription}>{product.variant.title}</Text>
                </Column>

                <Column style={productPriceWrapper} align="right">
                  <Text style={productPrice}>{`$${product.unit_price / 100}`}</Text>
                </Column>
              </Row>
            );
          })}
        </Section>
        <Hr style={productPriceLine} />
        <Section align="right">
          <Row>
            <Column style={tableCell} align="right">
              <Text style={productPriceTotal}>TOTAL</Text>
            </Column>
            <Column style={productPriceVerticalLine}></Column>
            <Column style={productPriceLargeWrapper}>
              <Text style={productPriceLarge}>$14.99</Text>
            </Column>
          </Row>
        </Section>
        <Hr style={productPriceLineBottom} />
        <Section>
          <Row>
            <Column align="center" style={block}>
              <Img
                src={`${MEDUSA_ADMIN_BACKEND_URL}/uploads/icon1.png`}
                width="60"
                height="17"
                alt="TinySquare2k3Logo"
              />
            </Column>
          </Row>
        </Section>

        <Section>
          <Row>
            <Column align="center" style={footerIcon}>
              <Img
                src={`${MEDUSA_ADMIN_BACKEND_URL}/uploads/icon1.png`}
                width="26"
                height="26"
                alt="TinySquare2k3Logo"
              />
            </Column>
          </Row>
        </Section>
        <Text style={footerLinksWrapper}>
          <Link href="https://ventruetechnologies.com/">Desarrollador</Link> •{' '}
          <Link href="https://ventruetechnologies.com/terminos">Términos y Condiciones</Link> •{' '}
          <Link href="https://ventruetechnologies.com/privacy/">Política de Privacidad </Link>
        </Text>
        <Text style={footerCopyright}>
          Desarrollado por VentrueTechnologies. <br />{' '}
          <Link href="https://ventruetechnologies.com/legal/"></Link>
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif',
  backgroundColor: '#ffffff',
};

const resetText = {
  margin: '0',
  padding: '0',
  lineHeight: 1.4,
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '660px',
  maxWidth: '100%',
};

const tableCell = { display: 'table-cell' };

const heading = {
  fontSize: '32px',
  fontWeight: '300',
  color: '#888888',
};

const cupomText = {
  textAlign: 'center' as const,
  margin: '36px 0 40px 0',
  fontSize: '14px',
  fontWeight: '500',
  color: '#111111',
};

const supStyle = {
  fontWeight: '300',
};

const informationTable = {
  borderCollapse: 'collapse' as const,
  borderSpacing: '0px',
  color: 'rgb(51,51,51)',
  backgroundColor: 'rgb(250,250,250)',
  borderRadius: '3px',
  fontSize: '12px',
};

const informationTableRow = {
  height: '46px',
};

const informationTableColumn = {
  paddingLeft: '20px',
  borderStyle: 'solid',
  borderColor: 'white',
  borderWidth: '0px 1px 1px 0px',
  height: '44px',
};

const informationTableLabel = {
  ...resetText,
  color: 'rgb(102,102,102)',
  fontSize: '10px',
};

const informationTableValue = {
  fontSize: '12px',
  margin: '0',
  padding: '0',
  lineHeight: 1.4,
};

const productTitleTable = {
  ...informationTable,
  margin: '30px 0 15px 0',
  height: '24px',
};

const productsTitle = {
  background: '#fafafa',
  paddingLeft: '10px',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
};

const productIcon = {
  margin: '0 0 0 20px',
  borderRadius: '14px',
  border: '1px solid rgba(128,128,128,0.2)',
};

const productTitle = { fontSize: '12px', fontWeight: '600', ...resetText };

const productDescription = {
  fontSize: '12px',
  color: 'rgb(102,102,102)',
  ...resetText,
};

const productLink = {
  fontSize: '12px',
  color: 'rgb(0,112,201)',
  textDecoration: 'none',
};

const divisor = {
  marginLeft: '4px',
  marginRight: '4px',
  color: 'rgb(51,51,51)',
  fontWeight: 200,
};

const productPriceTotal = {
  margin: '0',
  color: 'rgb(102,102,102)',
  fontSize: '10px',
  fontWeight: '600',
  padding: '0px 30px 0px 0px',
  textAlign: 'right' as const,
};

const productPrice = {
  fontSize: '12px',
  fontWeight: '600',
  margin: '0',
};

const productPriceLarge = {
  margin: '0px 20px 0px 0px',
  fontSize: '16px',
  fontWeight: '600',
  whiteSpace: 'nowrap' as const,
  textAlign: 'right' as const,
};

const productPriceWrapper = {
  display: 'table-cell',
  padding: '0px 20px 0px 0px',
  width: '100px',
  verticalAlign: 'top',
};

const productPriceLine = { margin: '30px 0 0 0' };

const productPriceVerticalLine = {
  height: '48px',
  borderLeft: '1px solid',
  borderColor: 'rgb(238,238,238)',
};

const productPriceLargeWrapper = { display: 'table-cell', width: '90px' };

const productPriceLineBottom = { margin: '0 0 75px 0' };

const block = { display: 'block' };

const ctaTitle = {
  display: 'block',
  margin: '15px 0 0 0',
};

const ctaText = { fontSize: '24px', fontWeight: '500' };

const walletWrapper = { display: 'table-cell', margin: '10px 0 0 0' };

const walletLink = { color: 'rgb(0,126,255)', textDecoration: 'none' };

const walletImage = {
  display: 'inherit',
  paddingRight: '8px',
  verticalAlign: 'middle',
};

const walletBottomLine = { margin: '65px 0 20px 0' };

const footerText = {
  fontSize: '12px',
  color: 'rgb(102,102,102)',
  margin: '0',
  lineHeight: 'auto',
  marginBottom: '16px',
};

const footerTextCenter = {
  fontSize: '12px',
  color: 'rgb(102,102,102)',
  margin: '20px 0',
  lineHeight: 'auto',
  textAlign: 'center' as const,
};

const footerLink = { color: 'rgb(0,115,255)' };

const footerIcon = { display: 'block', margin: '40px 0 0 0' };

const footerLinksWrapper = {
  margin: '8px 0 0 0',
  textAlign: 'center' as const,
  fontSize: '12px',
  color: 'rgb(102,102,102)',
};

const footerCopyright = {
  margin: '25px 0 0 0',
  textAlign: 'center' as const,
  fontSize: '12px',
  color: 'rgb(102,102,102)',
};

const walletLinkText = {
  fontSize: '14px',
  fontWeight: '400',
  textDecoration: 'none',
};
