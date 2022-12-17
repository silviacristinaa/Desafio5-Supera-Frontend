import "./App.css";
import { useState, useEffect } from 'react';
import Moment from 'moment';

function App() {
  const [accountId, setAccountId] = useState(null);
  const [initialDate, setInitialDate] = useState("");
  const [finalDate, setFinalDate] = useState("");
  const [transactionOperatorName, setTransactionOperatorName] = useState("");
  const [transferData, setTransferData] = useState();
  const [allowed, setAllowed] = useState(false);

  function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  function init() {
    let id = window.location.pathname;
    id = id.replace("/", "");

    if (isNumber(id) && !id.match(/^-?\d+\.\d+$/)) {
      setAllowed(true);
      setAccountId(id);
    } else {
      setAllowed(false);
    }
  }
  useEffect(() => {
    init();
  }, []);

  const handleChangeName = (event) => {
    setTransactionOperatorName(event.target.value);
  }

  const handleChangeFinalDate = (event) => {
    setFinalDate(event.target.value);
  }

  const handleChangeInitialDate = (event) => {
    setInitialDate(event.target.value);
  }

  const handleSearch = () => {
    let newInitialDate = initialDate ? initialDate + "T00:00:00" : "";
    let newFinalDate = finalDate ? finalDate + "T23:59:59" : "";

    fetch(`http://localhost:8080/api/transfers/${accountId}/?initialDate=${newInitialDate}&finalDate=${newFinalDate}&transactionOperatorName=${transactionOperatorName}`)
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        }
      }).then((data) => {
        setTransferData(data);
        console.log('data ====>', data);
      });
  }

  return (
    <div class="header">
      { allowed ?
        <main className="container">
          <form>
            <div class="content">
              <div class="blc">
                <label>Data de início
                  <input onChange={handleChangeInitialDate} type="date" value={initialDate} />
                </label>
              </div>
              <div class="blc">
                <label>Data de Fim
                  <input onChange={handleChangeFinalDate} type="date" value={finalDate} />
                </label>
              </div>
              <div class="blc">
                <label>Nome operador transacionado
                  <input onChange={handleChangeName} type="text" value={transactionOperatorName} />
                </label>
              </div>
            </div>
          </form>

          <button onClick={handleSearch} className="btn btn-primary">
            Pesquisar
          </button>

          {
            transferData ? (

              <div>
                <div className="row mt-5">
                  <p>Saldo total: R$ {transferData.totalBalance.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}</p>
                  <p>Saldo no período: R$ {transferData.balanceInPeriod.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}</p>
                  <table className="table table-bordered table-striped " >
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Valor</th>
                        <th>Tipo</th>
                        <th>Nome operador transacionado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        transferData.transferResponseDataDto.content.map(
                          transfer =>
                            <tr key={transfer.id}>
                              <td> {Moment(transfer.transferDate).format('DD/MM/YYYY')}</td>
                              <td> {transfer.value.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}</td>
                              <td> {transfer.type}</td>
                              <td> {transfer.transactionOperatorName}</td>
                            </tr>
                        )
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null
          }
        </main> : 
          <main className="container bg-light -5">
            <h2>PASSE NA URL O NÚMERO DA SUA CONTA BANCÁRIA</h2>
            <h3 className="lead">Exemplo: <a href="http://localhost:3000/1">http://localhost:3000/1 </a></h3>
          </main>
      }
    </div>
  );
}

export default App;
