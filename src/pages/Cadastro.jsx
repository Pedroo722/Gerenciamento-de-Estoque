import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import '../styles/cadastro.css';
import Header from '../components/Header.jsx';
import { Modal, Form, Select, Table, Button } from 'antd';
import axios from 'axios';
import { baseUrlClientes, baseUrlEstoque, baseUrlItems, baseUrlVendas } from '../util/constantes';
import { useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";

// Botão Voltar para Mobile 

const Bvoltar = () => {
  return (
    <a className="bvoltar" href="/">
      <i className="fas fa-arrow-left"></i>🡸 Voltar
    </a>
  );
};

// Mensagem para link para relatórios

const MensagSucess = () => {
  return (
    <div>
      <div id="success-message" style={{ display: 'none' }}>
        Venda cadastrada com sucesso!
      </div>
      <a id="relatorios-link" href="relatorios">
        Ir para Relatórios
      </a>
    </div>
  );
};

// Modal

const ModalProdutos = ({ isModalVisible, handleCancel, opcoesProdutos, control, venda, hideModal, config }) => {
  const [form] = Form.useForm();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [precoVenda, setPrecoVenda] = useState("");
  const [custoVendedor, setCustoVendedor] = useState("");
  const [produtoTableData, setProdutoTableData] = useState([]);
  const [quantidadeTableData, setQuantidadeTableData] = useState([]);
  const [estoqueDisponivel, setEstoqueDisponivel] = useState({});
  const [produtoIdBuscado, setProdutoIdBuscado] = useState(null);

  // Determina a quantidade atual no estoque
  const buscarQuantidadeDisponivel = (produtoId) => {
    const produto = opcoesProdutos.find((p) => p.value === produtoId);

    if (produto) {
      return produto.quantidade;
    }

    return 0;
  };

  // Atualiza a Tabela do Modal
  const atualizarTabelaItems = (vendaID) => {    
    axios.get(baseUrlItems + `?filters[venda][id][$eq]=${vendaID}&populate=*`, config)
    .then((response) => {
      if (response.status === 200) {
        const dadosItemVenda = response.data.data;
        console.log(dadosItemVenda);
        let dadosProcessadosItemVenda = dadosItemVenda.map((itemvenda) => {
          return {
            key: itemvenda.id,
            produto: itemvenda.attributes.produto.data.attributes.descricao,
            quantidade_vendida: itemvenda.attributes.quantidade_vendida,
            custo_venda: itemvenda.attributes.custo_venda,
            preco_venda: itemvenda.attributes.preco_venda,
          };
        });
        setProdutoTableData(dadosProcessadosItemVenda);
      } else {
        console.error('Erro na resposta da API');
      }
    })
    .catch((error) => {
      console.error('Erro ao fazer a chamada da API:', error);
    });
  };

  // Cadastra o produto na tabela
  const handleCadastrarProduto = async () => {
    const produto = selectedProduct;
    const preco_venda = document.getElementById("preco").value;
    const custo_venda = document.getElementById("custo").value;
    const quantidade_vendida = document.getElementById("quantidade").value;

    if (produto && preco_venda && custo_venda && quantidade_vendida) {
      const produtoId = produto;
      const quantidadeDisponivel = await buscarQuantidadeDisponivel(produtoId);

      console.log("produtoId:", produtoId);
      console.log("quantidade_vendida:", quantidade_vendida);

      // Verifique se a quantidade vendida não excede a quantidade disponível no estoque
      if (quantidadeDisponivel >= quantidade_vendida) {
        const data = { produto, preco_venda, custo_venda, quantidade_vendida };

        console.log("Dados do Produto: ", data);

        criarItemVenda(data);

        setEstoqueDisponivel({
          ...estoqueDisponivel,
          [produtoId]: quantidadeDisponivel - quantidade_vendida,
        });

        atualizarTabelaItems(venda);
      } else {
        alert('Produto não cadastrado. A unidades da venda não podem ser maior que a quantidade disponível no estoque');
      }
    }
  };

  // Faz o Post para ItemVenda
  const criarItemVenda = (data) => {
    if (data.produto && data.preco_venda && data.custo_venda && data.quantidade_vendida) {
      const novoItem = {
        data: {
          venda: venda,
          produto: data.produto,
          preco_venda: data.preco_venda,
          custo_venda: data.custo_venda,
          quantidade_vendida: data.quantidade_vendida
        },
      };

      axios.post(baseUrlItems, novoItem, config)
        .then((response) => {
          if (response.status === 200) {
            console.log("Item da Venda Cadastrada com Sucesso!");
          } else {
            console.error('Erro de servidor:', response);
          }
        })
        .catch((error) => {
          console.error('Erro ao adicionar o cliente:', error);
        });
    }
  };

  // Requisição Delete para ItemVenda
  const handleRemoverProduto = (itemvenda) => {
    axios.delete(baseUrlItems + `/${itemvenda.key}`, config)
    .then((response) => {
      if (response.status === 200) {
        atualizarTabelaItems(venda);
      } else {
        console.error('Erro na resposta da API ao excluir o item');
      }
    })
    .catch((error) => {
      console.error('Erro ao fazer a chamada da API para excluir a categoria:', error);
    });
  };

  // Operações para finalizar a venda quando o usuário clica em "Ok"
  const handleFinalizarVenda = () => {
    if (venda) {
      // Percorre a tabela e subtrai os items
      produtoTableData.forEach((item) => {
        const itemvendaId = item.key;
        const quantidadeVendida = item.quantidade_vendida;
        const produtoNome = item.produto;

        // Encontre o ID do produto com base no nome do produto
        const produtoId = opcoesProdutos.find((produto) => produto.label === produtoNome)?.value;

        console.log("Id do Produto: ", itemvendaId);
        console.log("Quantidade Vendida: ", quantidadeVendida);

        atualizarEstoque(itemvendaId, quantidadeVendida, produtoId);
      });

      hideModal();
      console.log(isModalVisible);
    }
  };

  // Retorna o id do produto ap artir do id do Itemvenda
  const procurarIdProduto = async (itemvendaId) => {
    try {
      const response = await axios.get(baseUrlEstoque + `?filters[item-venda][id][$eq]=${itemvendaId}&populate=*`, config);

      if (response.status === 200) {
        const dadosProdutoProcurado = response.data.data;

        if (dadosProdutoProcurado.length > 0) {
          const primeiroProdutoEncontrado = dadosProdutoProcurado[0];
          console.log("Produto encontrado:", primeiroProdutoEncontrado);
          return primeiroProdutoEncontrado.attributes;
        } else {
          console.error('Nenhum produto encontrado para o item de venda ID:', itemvendaId);
          return null;
        }
      } else {
        console.error('Erro na resposta da API');
        return null;
      }
    } catch (error) {
      console.error('Erro ao fazer a chamada da API:', error);
      return null;
    }
  };

  // Atualiza a quantidade atual do estoque
  const atualizarEstoque = async (itemvendaId, quantidadeVendida, produtoId) => {
    try {
      const produto = await procurarIdProduto(itemvendaId);
      console.log("Produto: ", produto);
      console.log("Id Prod FInal: ", produtoId);

      if (produto) {
        const quantidadeDisponivel = produto.quantidade;
        console.log("Quantidade Disponível: ", quantidadeDisponivel);

        if (quantidadeDisponivel >= quantidadeVendida) {
          const novaQuantidade = quantidadeDisponivel - quantidadeVendida;
          console.log("Quantidade Atualizada: ", novaQuantidade);

          const camposEditados = {};
          if (novaQuantidade) {
            camposEditados.quantidade = novaQuantidade;
          }
          axios.put(baseUrlEstoque + `/${produtoId}`, { data: camposEditados }, config)
          .then((response) => {
            if (response.status === 200) {
              console.log("Estoque atualizado com sucesso!");
            } else {
              console.error('Erro de servidor:', response);
            }
          })
          .catch((error) => {
            console.error('Erro na atualização do estoque', error);
          });
        } else {
          alert('Erro ao remover produto do estoque');
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar o estoque:', error);
    }
  };

  const columns = [
    {
      title: 'Produto',
      dataIndex: 'produto',
      key: 'produto',
    },
    {
      title: 'Preco',
      dataIndex: 'preco_venda',
      key: 'preco',
    },
    {
      title: 'Custo',
      dataIndex: 'custo_venda',
      key: 'custo',
    },
    {
      title: 'Quantidade',
      dataIndex: 'quantidade_vendida',
      key: 'quantidade',
    },
    {
      title: 'Ação',
      dataIndex: 'acao',
      key: 'acao',
      render: (text, record, index) => (
        <Button onClick={() => handleRemoverProduto(record)}>Remover</Button>
      ),
    },
  ];

  return (
    <Modal
      title="Produtos da Venda"
      visible={isModalVisible}
      onCancel={handleCancel}
      onOk={handleFinalizarVenda}
    >
      <label htmlFor="produto">Produto:</label>
      <Form.Item>
        <Controller
          name="produto"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              style={{ width: '100%' }}
              onChange={(value) => {
                setSelectedProduct(value);
                const produtoSelecionado = opcoesProdutos.find((produto) => produto.value === value);
                if (produtoSelecionado) {
                  setPrecoVenda(produtoSelecionado.preco.toString());
                  setCustoVendedor(produtoSelecionado.custo.toString());
                } else {
                  setPrecoVenda("");
                  setCustoVendedor("");
                }
              }}
            >
              {opcoesProdutos.map((produto) => (
                <Select.Option key={produto.value} value={produto.value}>
                  {produto.label}
                </Select.Option>
              ))}
            </Select>
          )}
        />
      </Form.Item>

      <div className="input-row-vendas">
        <label htmlFor="preco">Preço do Cliente:</label>
        <Controller
          name="preco"
          control={control}
          render={({ field }) => (
            <input
              type="text"
              id="preco"
              placeholder="Digite o preço de venda (por unidade)"
              {...field}
              value={precoVenda}
            />
          )}
        />
      </div>

      <div className="input-row-vendas">
        <label htmlFor="custo">Custo do Vendedor:</label>
        <Controller
          name="custo"
          control={control}
          render={({ field }) => (
            <input
              type="text"
              id="custo"
              placeholder="Digite o custo do produto (por unidade)"
              {...field}
              value={custoVendedor}
            />
          )}
        />
      </div>

      <div className="input-row-vendas">
        <label htmlFor="quantidade">Unidades Vendidas:</label>
        <Controller
          name="quantidade"
          control={control}
          render={({ field }) => (
            <input
              type="number"
              id="quantidade"
              placeholder="Digite a quantidade vendida"
              {...field}
              rules={[{ required: true, message: 'Por favor, insira a quantidade a ser vendida do produto!' }]}
            />
          )}
        />
      </div>

      <Button onClick={handleCadastrarProduto}>Cadastrar Produto</Button>
      <Table
        dataSource={produtoTableData}
        columns={columns}
      />
      <p>Aperte OK para finalizar a venda.</p>
    </Modal>
  );
};

// Componente Principal

const Cadastro = () => {
  const { control, handleSubmit } = useForm();
  const [opcoesClientes, setOpcoesClientes] = useState([]);
  const [opcoesProdutos, setOpcoesProdutos] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [vendaId, setVendaId] = useState(null);
  const token = useSelector((state) => state.token)
  
  const config = {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  };

  // redirecionamento se não estiver logado

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      console.log("Login")
      return navigate("/login");
    }
  }, [token]);

  // cadastrar
  
  const onSubmit = (data) => {
    // console.log(data);
    showModal();
    criarVenda(data);
  };

  const criarVenda = (data) => {
    if (data.cliente && data.pagamento && data.desconto && data.entrega && data.data) {
      const novaVenda = {
        data: {
          cliente: data.cliente,
          pagamento: data.pagamento,
          desconto: data.desconto,
          entrega: data.entrega,
          data: data.data,
        },
      };

      axios.post(baseUrlVendas, novaVenda, config)
        .then((response) => {
          if (response.status === 200) {
            console.log("Venda Cadastrada com Sucesso!");
            console.log(response.data.data.id) // ID
            setVendaId(response.data.data.id);
          } else {
            console.error('Erro de servidor:', response);
          }
        })
        .catch((error) => {
          console.error('Erro ao adicionar o cliente:', error);
        });
    }
  };

  useEffect(() => {
    // Get para opção de Clientes
    axios.get(baseUrlClientes, config)
      .then((response) => {
        if (response.status === 200) {
          const dadosClientes = response.data.data;
          let dadosProcessadosClientes = dadosClientes.map((cliente) => {
            return {
              value: cliente.id,
              label: cliente.attributes.nome,
            };
          });
          console.log(dadosProcessadosClientes);
          setOpcoesClientes(dadosProcessadosClientes);
        } else {
          console.error('Erro na resposta da API');
        }
      })
      .catch((error) => {
        console.error('Erro ao fazer a chamada da API:', error);
      });

    // Get para Produtos
    axios.get(baseUrlEstoque, config)
      .then((response) => {
        if (response.status === 200) {
          const dadosProdutos = response.data.data;
          let dadosProcessadosProdutos = dadosProdutos.map((produto) => {
            return {
              value: produto.id,
              label: produto.attributes.descricao,
              preco: produto.attributes.preco,
              custo: produto.attributes.custo,
              quantidade: produto.attributes.quantidade,
            };
          });
          console.log(dadosProcessadosProdutos);
          setOpcoesProdutos(dadosProcessadosProdutos);
        } else {
          console.error('Erro na resposta da API de produtos');
        }
      })
      .catch((error) => {
        console.error('Erro ao fazer a chamada da API de produtos:', error);
      });
  }, []);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    if (vendaId) {
      axios
        .delete(baseUrlItems + `/${vendaId}`, config)
        .then((response) => {
          if (response.status === 200) {
            setIsModalVisible(false);
            console.log("Venda apagada com sucesso!");
          } else {
            console.error('Erro na resposta da API ao cancelar a venda');
          }
        })
        .catch((error) => {
          console.error('Erro ao fazer a chamada da API para excluir a venda:', error);
        });
    } else {
      setIsModalVisible(false);
    }
  };

  return (
    <div>
      <Header />
      <Bvoltar />
      <div className="container-vendas">
        <div className="input-container-vendas">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="input-row-vendas">
              <label htmlFor="cliente">Cliente:</label>
              <Controller
                name="cliente"
                control={control}
                render={({ field }) => (
                  <select id="cliente" {...field}>
                    <option value="">Selecionar Cliente</option>
                    {opcoesClientes.map((cliente) => (
                      <option key={cliente.value} value={cliente.value}>
                        {cliente.label}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>
            <div className="input-row-vendas">
              <label htmlFor="pagamento">Tipo de Pagamento:</label>
              <Controller
                name="pagamento"
                control={control}
                render={({ field }) => (
                  <select
                    id="pagamento"
                    name="pagamento"
                    {...field}
                  >
                    <option value="">Selecionar Pagamento</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Pix">Pix</option>
                    <option value="Crédito">Crédito</option>
                    <option value="Débito">Débito</option>
                  </select>
                )}
              />
            </div>
            <div className="input-row-vendas" id="valor-desconto-container">
              <label htmlFor="desconto">Desconto:</label>
              <Controller
                name="desconto"
                control={control}
                render={({ field }) => (
                  <input
                    type="text"
                    id="desconto"
                    placeholder="Digite o valor do desconto em R$"
                    {...field}
                  />
                )}
              />
            </div>
            <div className="input-row-vendas" id="valor-desconto-container">
              <label htmlFor="entrega">Valor de Entrega:</label>
              <Controller
                name="entrega"
                control={control}
                render={({ field }) => (
                  <input
                    type="text"
                    id="entrega"
                    placeholder="Digite o valor da entrega"
                    {...field}
                  />
                )}
              />
            </div>
            <div className="input-row-vendas">
              <label htmlFor="data">Data de Venda:</label>
              <Controller
                name="data"
                control={control}
                render={({ field }) => (
                  <input
                    type="date"
                    id="data"
                    {...field}
                  />
                )}
              />
            </div>
            <button type="submit">
              Criar Venda
            </button>
          </form>
        </div>
      </div>
      <MensagSucess />
      <ModalProdutos
        isModalVisible={isModalVisible}
        handleCancel={handleCancel}
        opcoesProdutos={opcoesProdutos}
        onSubmit={onSubmit}
        control={control}
        venda={vendaId}
        hideModal={hideModal}
        config={config}
      />
    </div>
  );
};

export default Cadastro;