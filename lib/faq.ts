/**
 * Preguntas frecuentes de la home.
 * Lo que está entre [corchetes] es un dato que falta completar: mientras
 * quede alguno, esa respuesta se ve resaltada y no se le pasa a Google.
 */
export type FaqItem = {
  question: string;
  answer: string;
  link?: { href: string; label: string };
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: '¿Hay un mínimo de compra?',
    answer: 'No. Podés pedir desde una sola remera, tanto de nuestros diseños como personalizada.',
  },
  {
    question: '¿Hacen envíos?',
    answer:
      'Sí, enviamos a todo el país por [empresa de envíos]. El costo y la forma de entrega los coordinamos por WhatsApp al confirmar el pedido. También podés retirar en Zona Oeste, Buenos Aires.',
  },
  {
    question: '¿Cuánto tarda mi pedido?',
    answer: 'Tu pedido está listo en [X días hábiles]. Después se suma el tiempo del envío.',
  },
  {
    question: '¿Cómo sé qué talle me queda?',
    answer:
      'Cada remera tiene su tabla de talles con ancho y largo en centímetros. Compará con una remera tuya que te quede bien y, si tenés dudas, escribinos.',
  },
  {
    question: '¿Qué es el estampado DTF? ¿Se sale con los lavados?',
    answer:
      'Es una técnica de impresión que permite colores ilimitados y mucho detalle, y queda flexible sobre la tela. Para que dure más, lavala del revés con agua fría y no planches sobre el estampado.',
  },
  {
    question: '¿Cómo pago?',
    answer: 'Armás tu pedido en la web y lo confirmás por WhatsApp. Ahí coordinamos el pago: [medios de pago].',
  },
  {
    question: '¿Puedo cambiar el talle?',
    answer: '[Política de cambios: plazo y condiciones].',
  },
  {
    question: '¿Hacen diseños personalizados o por cantidad?',
    answer:
      'Sí. Estampamos tu propia imagen, frase o idea desde una unidad, y hacemos producciones por cantidad para empresas, eventos y emprendimientos.',
    link: { href: '/personalizados', label: 'Ver personalizados' },
  },
];

export function isFaqPending(item: FaqItem) {
  return /\[[^\]]+\]/.test(item.answer);
}
