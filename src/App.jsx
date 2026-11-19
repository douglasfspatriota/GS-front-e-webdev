import { BrowserRouter, Routes, Route } from 'react-router';
import { ProvedorDados } from './contexto/DadosContexto.jsx';
import Layout from './componentes/Layout.jsx';
import MinhaConta from './paginas/MinhaConta.jsx';
import Historico from './paginas/Historico.jsx';
import Investigar from './paginas/Investigar.jsx';
import Verificacoes from './paginas/Verificacoes.jsx';
import Monitor from './paginas/Monitor.jsx';
import ComoFunciona from './paginas/ComoFunciona.jsx';
import NaoEncontrada from './paginas/NaoEncontrada.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <ProvedorDados>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<MinhaConta />} />
            <Route path="historico" element={<Historico />} />
            <Route path="investigar" element={<Investigar />} />
            <Route path="verificacoes" element={<Verificacoes />} />
            <Route path="monitor" element={<Monitor />} />
            <Route path="como-funciona" element={<ComoFunciona />} />
            <Route path="*" element={<NaoEncontrada />} />
          </Route>
        </Routes>
      </ProvedorDados>
    </BrowserRouter>
  );
}
