// Formulário para cadastrar ou editar uma conta de água.
// Valida no navegador com as mesmas regras da API e mostra a prévia do consumo.
import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import Campo from './Campo.jsx';
import Botao from './Botao.jsx';
import Aviso from './Aviso.jsx';
import { validarConta, mesJaCadastrado, lerNumero } from '../regras/validacao.js';
import { litrosPorPessoaDia } from '../regras/consumo.js';
import { formatarLitros } from '../regras/formatos.js';

const VAZIO = { mes: '', volume_m3: '', valor_reais: '', dias: '30', moradores: '' };

function paraTexto(conta) {
  if (!conta) return VAZIO;
  return {
    mes: conta.mes,
    volume_m3: String(conta.volume_m3).replace('.', ','),
    valor_reais: String(conta.valor_reais).replace('.', ','),
    dias: String(conta.dias),
    moradores: String(conta.moradores),
  };
}

export default function FormularioConta({ conta, contasExistentes = [], onSalvar, onCancelar }) {
  const [valores, setValores] = useState(() => paraTexto(conta));
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const editando = Boolean(conta);

  // Ao trocar a conta em edição, recarrega os valores do formulário.
  useEffect(() => {
    setValores(paraTexto(conta));
    setErros({});
    setErroGeral(null);
  }, [conta]);

  function alterar(evento) {
    const { name, value } = evento.target;
    setValores((v) => ({ ...v, [name]: value }));
    if (erros[name]) setErros((e) => ({ ...e, [name]: undefined }));
  }

  async function enviar(evento) {
    evento.preventDefault();
    setErroGeral(null);
    const resultado = validarConta(valores);
    const novosErros = { ...resultado.erros };
    if (resultado.valido && mesJaCadastrado(contasExistentes, resultado.conta.mes, conta?.id ?? null)) {
      novosErros.mes = 'Já existe uma conta para este mês. Edite a conta existente.';
    }
    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }
    setEnviando(true);
    try {
      await onSalvar(resultado.conta);
      if (!editando) setValores(VAZIO);
    } catch (e) {
      setErros(e.erros ?? {});
      setErroGeral(e.message);
    } finally {
      setEnviando(false);
    }
  }

  // Prévia do consumo normalizado enquanto o morador digita.
  const previa = litrosPorPessoaDia({
    volume_m3: lerNumero(valores.volume_m3),
    dias: Number(valores.dias),
    moradores: Number(valores.moradores),
  });

  return (
    <form onSubmit={enviar} noValidate className="space-y-4 rounded-2xl border border-agua-100 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-agua-900">{editando ? 'Editar conta' : 'Nova conta'}</h2>
      {erroGeral && <Aviso tipo="erro" titulo="Não foi possível salvar">{erroGeral}</Aviso>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo rotulo="Mês da conta" name="mes" type="month" value={valores.mes} onChange={alterar} erro={erros.mes} required />
        <Campo
          rotulo="Volume consumido"
          name="volume_m3"
          inputMode="decimal"
          sufixo="m³"
          dica="Aparece na conta como consumo ou volume faturado."
          value={valores.volume_m3}
          onChange={alterar}
          erro={erros.volume_m3}
          required
        />
        <Campo
          rotulo="Valor cobrado"
          name="valor_reais"
          inputMode="decimal"
          sufixo="R$"
          value={valores.valor_reais}
          onChange={alterar}
          erro={erros.valor_reais}
          required
        />
        <Campo
          rotulo="Dias do período"
          name="dias"
          inputMode="numeric"
          sufixo="dias"
          dica="Intervalo entre a leitura anterior e a atual."
          value={valores.dias}
          onChange={alterar}
          erro={erros.dias}
          required
        />
        <Campo
          rotulo="Moradores no período"
          name="moradores"
          inputMode="numeric"
          sufixo="pessoas"
          value={valores.moradores}
          onChange={alterar}
          erro={erros.moradores}
          required
        />
        <div className="flex flex-col justify-center rounded-xl bg-agua-50 p-4" aria-live="polite">
          <p className="text-sm text-agua-900">Prévia do consumo</p>
          <p className="font-mono text-2xl font-bold text-agua-900">
            {previa > 0 && Number.isFinite(previa) ? formatarLitros(previa) : '—'}
          </p>
          <p className="text-sm text-agua-900">por pessoa por dia</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Botao type="submit" icone={Save} carregando={enviando}>
          {editando ? 'Salvar alterações' : 'Cadastrar conta'}
        </Botao>
        {onCancelar && (
          <Botao variante="secundario" onClick={onCancelar}>
            Cancelar
          </Botao>
        )}
      </div>
    </form>
  );
}
