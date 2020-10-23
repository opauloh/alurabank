import { NegociacoesView, MensagemView } from '../views/index';
import { Negociacoes, Negociacao } from '../models/index';
import { domInject, throttle } from '../helpers/decorators/index';
import { NegociacaoService } from '../services/index';
import { imprime } from '../helpers/Utils';

export class NegociacaoController {

    @domInject('#data')
    private _inputData: JQuery;
    @domInject('#quantidade')
    private _inputQuantidade: JQuery;
    @domInject('#valor')
    private _inputValor: JQuery;
    private _negociacoes = new Negociacoes();
    private _negociacoesView = new NegociacoesView('#negociacoesView');
    private _mensagemView = new MensagemView('#mensagemView');
    private _service = new NegociacaoService();


    constructor() {
        this._negociacoesView.update(this._negociacoes);
    }

    @throttle(500)
    async importaDados() {

        try {
            const negociacoesParaImportar = await this._service
                .obterNegociacoes(res => {
                    if (res.ok)
                        return res;

                    throw new Error(res.statusText);
                });

            const negociacoesJaImportadas = this._negociacoes.paraArray();

            negociacoesParaImportar
                .filter(negociacao => !negociacoesJaImportadas.some(jaImportada =>
                    negociacao.ehIgual(jaImportada)))
                .forEach(negociacao =>
                    this._negociacoes.adiciona(negociacao));

            this._negociacoesView.update(this._negociacoes)
        } catch (err) {
            this._mensagemView.update(err.message);
        }

        // this._service
        //     .obterNegociacoes(res => {
        //         if (res.ok)
        //             return res;

        //         throw new Error(res.statusText);
        //     })
        //     .then(negociacoesParaImportar => {
        //         const negociacoesJaImportadas = this._negociacoes.paraArray();

        //         negociacoesParaImportar
        //             .filter(negociacao => !negociacoesJaImportadas.some(jaImportada =>
        //                 negociacao.ehIgual(jaImportada)))
        //             .forEach(negociacao =>
        //                 this._negociacoes.adiciona(negociacao));

        //         this._negociacoesView.update(this._negociacoes)
        //     })
        //     .catch(err => this._mensagemView.update(err.message));
    }

    @throttle(500)
    adiciona() {

        let data = new Date(this._inputData.val().replace(/-/g, ','));
        if (!this.ehdiaUtil(data)) {
            this._mensagemView.update('Somente em dias úteis, por favor');
            return;
        }
        const negociacao = new Negociacao(
            data,
            parseInt(this._inputQuantidade.val()),
            parseFloat(this._inputValor.val())
        );


        this._negociacoes.adiciona(negociacao);
        this._negociacoesView.update(this._negociacoes);

        imprime(negociacao, this._negociacoes);

        this._mensagemView.update("Negociação inserida com sucesso!");
    }

    private ehdiaUtil(data: Date) {
        return data.getDay() !== DiaDaSemana.Sabado && data.getDay() !== DiaDaSemana.Domingo;
    }
}

enum DiaDaSemana {
    Domingo,
    Segunda,
    Terca,
    Quarta,
    Quinta,
    Sexta,
    Sabado
}