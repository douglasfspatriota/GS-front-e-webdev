import { Link } from 'react-router';
import TituloPagina from '../componentes/TituloPagina.jsx';

export default function NaoEncontrada() {
  return (
    <div>
      <TituloPagina titulo="Página não encontrada" descricao="O endereço digitado não existe no Gota Alerta." />
      <Link to="/" className="font-semibold text-agua-700 underline">Voltar para Minha conta</Link>
    </div>
  );
}
