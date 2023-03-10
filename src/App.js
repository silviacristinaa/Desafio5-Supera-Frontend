import "./App.css";
import { useState, useEffect } from 'react';
import Moment from 'moment';
import Pagination from "@mui/material/Pagination";

function App() {
  const [accountId, setAccountId] = useState(null);
  const [initialDate, setInitialDate] = useState("");
  const [finalDate, setFinalDate] = useState("");
  const [transactionOperatorName, setTransactionOperatorName] = useState("");
  const [transferData, setTransferData] = useState();
  const [allowed, setAllowed] = useState(false);

  const [paginationPage, setPaginationPage] = useState(1);
  const [count, setCount] = useState(1);
  const [pageSize, setPageSize] = useState(1);

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

  const handlePageChange = (event, value) => {
    search(value - 1);
  };

  function search(value) {
    let newInitialDate = initialDate ? initialDate + "T00:00:00" : "";
    let newFinalDate = finalDate ? finalDate + "T23:59:59" : "";

    fetch(`http://localhost:8080/api/transfers/${accountId}/?initialDate=${newInitialDate}&finalDate=${newFinalDate}&transactionOperatorName=${transactionOperatorName}&page=${value}&size=${pageSize}`)
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        }
      }).then((data) => {
        setTransferData(data);
        setPaginationPage(data.transferResponseDataDto.number + 1);
        setCount(data.transferResponseDataDto.totalPages);
      });
  }

  const handleSearch = () => {
    search(0);
  }

  return (
    <div class="header">
      {allowed ?
        <main>
          <form>
            <div class="form-row">
              <div class="form-group col-md-2">
                <label for="inputInitialDate">Data de in??cio</label>
                <input type="date" class="form-control" id="inputInitialDate"
                  onChange={handleChangeInitialDate} value={initialDate} />
              </div>
              <div class="form-group col-md-2">
                <label for="inputFinalDate">Data de Fim</label>
                <input type="date" class="form-control" id="inputFinalDate"
                  onChange={handleChangeFinalDate} value={finalDate} />
              </div>
              <div class="form-group col-md-4">
                <label for="inputName">Nome operador transacionado</label>
                <input onChange={handleChangeName} type="text" value={transactionOperatorName}
                  class="form-control" id="inputName" />
              </div>
            </div>

          </form>

          <button onClick={handleSearch} className="btn btn-primary button">
            Pesquisar
          </button>

          {
            transferData ? (

              <div>
                <div className="row mt-5">
                  <div className="paragraph">
                    <p>Saldo total: {transferData.totalBalance.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}</p>
                    <p>Saldo no per??odo: {transferData.balanceInPeriod.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}</p>
                  </div>

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
                              <td> {transfer.value.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}</td>
                              <td> {transfer.type}</td>
                              <td> {transfer.transactionOperatorName}</td>
                            </tr>
                        )
                      }
                    </tbody>
                  </table>

                  <Pagination
                    color="primary"
                    className="my-3"
                    count={count}
                    page={paginationPage}
                    siblingCount={1}
                    boundaryCount={1}
                    variant="outlined"
                    onChange={handlePageChange}
                  />
                </div>
              </div>
            ) : null
          }
        </main> :
        <main className="container bg-light -5">
          <h2>PASSE NA URL O N??MERO DA SUA CONTA BANC??RIA</h2>
          <h3 className="lead">Exemplo: <a href="http://localhost:3000/1">http://localhost:3000/1 </a></h3>
        </main>
      }
    </div>
  );
}

export default App;
