import { CurrencyPipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { Loan, Payment, Recurrence } from '@rappi/models';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

@Injectable({
  providedIn: 'root',
})
export class DocGeneratorsService {
  printLoanReceipt(loan: Loan) {
    const currency = new CurrencyPipe('es-US', 'USD');
    const subTotal =
      loan.products?.map((p) => p.price_base).reduce((a, b) => a + b, 0) ?? 0;
    const dd = {
      content: [
        {
          columns: [
            {
              image:
                'data:image/png;base64,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',
              width: 75,
            },
            [
              {
                text: 'Recibo de prestamo',
                color: '#333333',
                width: '*',
                fontSize: 28,
                bold: true,
                alignment: 'right',
                margin: [0, 0, 0, 15],
              },
              {
                stack: [
                  {
                    columns: [
                      {
                        text: 'No. prestamo',
                        color: '#aaaaab',
                        bold: true,
                        width: '*',
                        fontSize: 11,
                        alignment: 'right',
                      },
                      {
                        text: String(loan.id).padStart(5, '0'),
                        bold: true,
                        color: '#333333',
                        fontSize: 11,
                        alignment: 'right',
                        width: 100,
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: 'Fecha de prestamo',
                        color: '#aaaaab',
                        bold: true,
                        width: '*',
                        fontSize: 11,
                        alignment: 'right',
                      },
                      {
                        text: format(loan.created_at, `dd/MM/yyyy`, {
                          locale: es,
                        }),
                        bold: true,
                        color: '#333333',
                        fontSize: 11,
                        alignment: 'right',
                        width: 100,
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: 'Vendedor',
                        color: '#aaaaab',
                        bold: true,
                        fontSize: 11,
                        alignment: 'right',
                        width: '*',
                      },
                      {
                        text: '',
                        bold: true,
                        fontSize: 14,
                        alignment: 'right',
                        color: 'green',
                        width: 100,
                      },
                    ],
                  },
                ],
              },
            ],
          ],
        },
        {
          columns: [
            {
              text: 'Prestamo',
              color: '#aaaaab',
              bold: true,
              fontSize: 14,
              alignment: 'left',
              margin: [0, 20, 0, 5],
            },
            {
              text: 'Cliente',
              color: '#aaaaab',
              bold: true,
              fontSize: 14,
              alignment: 'left',
              margin: [0, 20, 0, 5],
            },
          ],
        },
        {
          columns: [
            {
              text: 'Rappi Presta \n RUC 155745725-2-2023 DV 88',
              bold: true,
              color: '#333333',
              alignment: 'left',
            },
            {
              text: `${loan.client?.first_name} ${loan.client?.last_name} \n ${loan.client?.document_id}`,
              bold: true,
              color: '#333333',
              alignment: 'left',
            },
          ],
        },
        {
          columns: [
            {
              text: 'Contacto',
              color: '#aaaaab',
              bold: true,
              margin: [0, 7, 0, 3],
            },
            {
              text: 'Contacto',
              color: '#aaaaab',
              bold: true,
              margin: [0, 7, 0, 3],
            },
          ],
        },
        {
          columns: [
            {
              text: 'TEL: 6951-4391',
              style: 'invoiceBillingAddress',
            },
            {
              text: `TEL: ${loan.client?.phone_number}`,
              style: 'invoiceBillingAddress',
            },
          ],
        },
        '\n\n',
        {
          layout: {
            defaultBorder: false,
            hLineWidth: function (_i: number) {
              return 1;
            },
            vLineWidth: function (_i: number) {
              return 1;
            },
            hLineColor: function (i: number) {
              if (i === 1 || i === 0) {
                return '#bfdde8';
              }
              return '#eaeaea';
            },
            vLineColor: function (_i: number) {
              return '#eaeaea';
            },
            hLineStyle: function (i: number, node: any) {
              if (i === 0 || i === node.table.body.length) {
                return null;
              }
              return {};
            },
            // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
            paddingLeft: function () {
              return 10;
            },
            paddingRight: function () {
              return 10;
            },
            paddingTop: function () {
              return 2;
            },
            paddingBottom: function () {
              return 2;
            },
            fillColor: function () {
              return '#fff';
            },
          },
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 80],
            body: [
              [
                {
                  text: 'Descripcion',
                  fillColor: '#eaf2f5',
                  border: [false, true, false, true],
                  margin: [0, 3, 0, 3],
                  textTransform: 'uppercase',
                },
                {
                  text: 'Ctd.',
                  fillColor: '#eaf2f5',
                  border: [false, true, false, true],
                  margin: [0, 3, 0, 3],
                  textTransform: 'uppercase',
                },
                {
                  text: 'TOTAL',
                  border: [false, true, false, true],
                  alignment: 'right',
                  fillColor: '#eaf2f5',
                  margin: [0, 3, 0, 3],
                  textTransform: 'uppercase',
                },
              ],
              ...loan!.products!.map((product) => [
                {
                  text: product.description,
                  border: [false, false, false, true],
                  margin: [0, 3, 0, 3],
                  alignment: 'left',
                },
                {
                  text: `1`,
                  border: [false, false, false, true],
                  fillColor: '#f5f5f5',
                  alignment: 'right',
                  margin: [0, 3, 0, 3],
                },
                {
                  text: currency.transform(product.price_base, 'USD', 'symbol'),
                  border: [false, false, false, true],
                  fillColor: '#f5f5f5',
                  alignment: 'right',
                  margin: [0, 3, 0, 3],
                },
              ]),
            ],
          },
        },
        '\n',
        '\n\n',
        {
          layout: {
            defaultBorder: false,
            hLineWidth: function () {
              return 1;
            },
            vLineWidth: function () {
              return 1;
            },
            hLineColor: function () {
              return '#eaeaea';
            },
            vLineColor: function () {
              return '#eaeaea';
            },
            hLineStyle: function () {
              // if (i === 0 || i === node.table.body.length) {
              return null;
              //}
            },
            // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
            paddingLeft: function () {
              return 10;
            },
            paddingRight: function () {
              return 10;
            },
            paddingTop: function () {
              return 3;
            },
            paddingBottom: function () {
              return 3;
            },
            fillColor: (_rowIndex: number, _node: any, _columnIndex: number) =>
              '#fff',
          },
          table: {
            headerRows: 1,
            widths: ['*', 'auto'],
            body: [
              [
                {
                  text: 'Payment Subtotal',
                  border: [false, true, false, true],
                  alignment: 'right',
                  margin: [0, 3, 0, 3],
                },
                {
                  border: [false, true, false, true],
                  text: currency.transform(subTotal, 'USD', 'symbol'),
                  alignment: 'right',
                  fillColor: '#f5f5f5',
                  margin: [0, 3, 0, 3],
                },
              ],

              [
                {
                  text: 'Total Amount',
                  bold: true,
                  fontSize: 20,
                  alignment: 'right',
                  border: [false, false, false, true],
                  margin: [0, 3, 0, 3],
                },
                {
                  text: currency.transform(subTotal, 'USD', 'symbol'),
                  bold: true,
                  fontSize: 20,
                  alignment: 'right',
                  border: [false, false, false, true],
                  fillColor: '#f5f5f5',
                  margin: [0, 3, 0, 3],
                },
              ],
            ],
          },
        },
        '\n\n',
        {
          text: 'NOTAS',
          style: 'notesTitle',
        },
        {
          text: `Termino: ${loan.installments_count} cuotas de ${currency.transform(loan.installments[0].amount)} \n Periodicidad: ${loan.recurrent_id === Recurrence.Mensual ? 'Mensual' : 'Quincenal'} \n Fecha de pago: ${format(loan.first_payment_date, 'dd/MM/yyyy', { locale: es })}`,
          style: 'notesText',
        },
      ],
      styles: {
        notesTitle: {
          fontSize: 10,
          bold: true,
          margin: [0, 50, 0, 3],
        },
        notesText: {
          fontSize: 10,
        },
      },
      defaultStyle: {
        columnGap: 20,
        //font: 'Quicksand',
      },
    } as any;

    pdfMake
      .createPdf(
        dd,
        {},
        {
          // Default font should still be available
          Roboto: {
            normal: 'Roboto-Regular.ttf',
            bold: 'Roboto-Medium.ttf',
            italics: 'Roboto-Italic.ttf',
            bolditalics: 'Roboto-Italic.ttf',
          },
          // Make sure you define all 4 components - normal, bold, italics, bolditalics - (even if they all point to the same font file)
          Helvetica: {
            normal: 'Helvetica',
            bold: 'Helvetica-Bold',
            italics: 'Helvetica-Oblique',
            bolditalics: 'Helvetica-BoldOblique',
          },
        },
        pdfFonts.pdfMake.vfs,
      )
      .open();
  }

  printPaymentReceipt(payment: Payment, loan?: Loan) {
    const currency = new CurrencyPipe('es-US', 'USD');
    loan = loan ?? payment.loan;
    const dd = {
      content: [
        {
          columns: [
            {
              image:
                'data:image/png;base64,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',
              width: 75,
            },
            [
              {
                text: 'Recibo de pago',
                color: '#333333',
                width: '*',
                fontSize: 20,
                bold: true,
                alignment: 'right',
                margin: [0, 0, 0, 15],
              },
              {
                stack: [
                  {
                    columns: [
                      {
                        text: 'No. prestamo',
                        color: '#aaaaab',
                        bold: true,
                        width: '*',
                        fontSize: 11,
                        alignment: 'right',
                      },
                      {
                        text: String(loan?.id).padStart(5, '0'),
                        bold: true,
                        color: '#333333',
                        fontSize: 11,
                        alignment: 'right',
                        width: 100,
                      },
                    ],
                  },
                ],
              },
            ],
          ],
        },
        {
          columns: [
            {
              text: 'Prestamo',
              color: '#aaaaab',
              bold: true,
              fontSize: 14,
              alignment: 'left',
              margin: [0, 20, 0, 5],
            },
            {
              text: 'Cliente',
              color: '#aaaaab',
              bold: true,
              fontSize: 14,
              alignment: 'left',
              margin: [0, 20, 0, 5],
            },
          ],
        },
        {
          columns: [
            {
              text: 'Rappi Presta \n RUC 155745725-2-2023 DV 88',
              bold: true,
              color: '#333333',
              alignment: 'left',
            },
            {
              text: `${loan?.client?.first_name} ${loan?.client?.last_name} \n ${loan?.client?.document_id}`,
              bold: true,
              color: '#333333',
              alignment: 'left',
            },
          ],
        },
        '\n\n',
        {
          layout: {
            defaultBorder: false,
            hLineWidth: function (_i: number) {
              return 1;
            },
            vLineWidth: function (_i: number) {
              return 1;
            },
            hLineColor: function (i: number) {
              if (i === 1 || i === 0) {
                return '#bfdde8';
              }
              return '#eaeaea';
            },
            vLineColor: function (_i: number) {
              return '#eaeaea';
            },
            hLineStyle: function (i: number, node: any) {
              if (i === 0 || i === node.table.body.length) {
                return null;
              }
              return {};
            },
            // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
            paddingLeft: function () {
              return 10;
            },
            paddingRight: function () {
              return 10;
            },
            paddingTop: function () {
              return 2;
            },
            paddingBottom: function () {
              return 2;
            },
            fillColor: function () {
              return '#fff';
            },
          },
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 80],
            fontSize: 10,
            body: [
              [
                {
                  text: 'Descripcion',
                  fillColor: '#eaf2f5',
                  border: [false, true, false, true],
                  margin: [0, 3, 0, 3],
                  textTransform: 'uppercase',
                },
                {
                  text: 'Ref.',
                  fillColor: '#eaf2f5',
                  border: [false, true, false, true],
                  margin: [0, 3, 0, 3],
                  textTransform: 'uppercase',
                },
                {
                  text: 'TOTAL',
                  border: [false, true, false, true],
                  alignment: 'right',
                  fillColor: '#eaf2f5',
                  margin: [0, 3, 0, 3],
                  textTransform: 'uppercase',
                },
              ],
              [
                {
                  text: payment.notes ?? 'Pago de cuota',
                  border: [false, false, false, true],
                  margin: [0, 3, 0, 3],
                  alignment: 'left',
                },
                {
                  text: payment.reference,
                  border: [false, false, false, true],
                  fillColor: '#f5f5f5',
                  alignment: 'right',
                  margin: [0, 3, 0, 3],
                },
                {
                  text: currency.transform(payment.amount, 'USD', 'symbol'),
                  border: [false, false, false, true],
                  fillColor: '#f5f5f5',
                  alignment: 'right',
                  margin: [0, 3, 0, 3],
                },
              ],
            ],
          },
        },
        '\n',
        '\n\n',
        {
          layout: {
            defaultBorder: false,
            hLineWidth: function () {
              return 1;
            },
            vLineWidth: function () {
              return 1;
            },
            hLineColor: function () {
              return '#eaeaea';
            },
            vLineColor: function () {
              return '#eaeaea';
            },
            hLineStyle: function () {
              // if (i === 0 || i === node.table.body.length) {
              return null;
              //}
            },
            // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
            paddingLeft: function () {
              return 10;
            },
            paddingRight: function () {
              return 10;
            },
            paddingTop: function () {
              return 3;
            },
            paddingBottom: function () {
              return 3;
            },
            fillColor: (_rowIndex: number, _node: any, _columnIndex: number) =>
              '#fff',
          },
          table: {
            headerRows: 1,
            widths: ['*', 'auto'],
            body: [
              [
                {
                  text: 'Total',
                  bold: true,
                  fontSize: 13,
                  alignment: 'right',
                  border: [false, false, false, true],
                  margin: [0, 3, 0, 3],
                },
                {
                  text: currency.transform(payment.amount, 'USD', 'symbol'),
                  bold: true,
                  fontSize: 13,
                  alignment: 'right',
                  border: [false, false, false, true],
                  fillColor: '#f5f5f5',
                  margin: [0, 3, 0, 3],
                },
              ],
            ],
          },
        },
        '\n\n',
      ],
      styles: {
        notesTitle: {
          fontSize: 10,
          bold: true,
          margin: [0, 50, 0, 3],
        },
        notesText: {
          fontSize: 10,
        },
      },
      defaultStyle: {
        columnGap: 20,
        //font: 'Quicksand',
      },
    } as any;

    pdfMake
      .createPdf(
        dd,
        {},
        {
          // Default font should still be available
          Roboto: {
            normal: 'Roboto-Regular.ttf',
            bold: 'Roboto-Medium.ttf',
            italics: 'Roboto-Italic.ttf',
            bolditalics: 'Roboto-Italic.ttf',
          },
          // Make sure you define all 4 components - normal, bold, italics, bolditalics - (even if they all point to the same font file)
          Helvetica: {
            normal: 'Helvetica',
            bold: 'Helvetica-Bold',
            italics: 'Helvetica-Oblique',
            bolditalics: 'Helvetica-BoldOblique',
          },
        },
        pdfFonts.pdfMake.vfs,
      )
      .open();
  }
}
