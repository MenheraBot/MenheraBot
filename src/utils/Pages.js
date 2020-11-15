const { MessageCollector } = require('discord.js')

/**
 * tai flor sPARA DE GEME VEIKSADSAKD
 * hmmmmmmmmmmmmmm uhawudhwahuawhduawhdwuadh
 * 
 */

 // sabe oq seria legal? as coisas da m!vila n tem paginas,
 // so mostra as opções pra vender, mas ai tipo,
 // mas n precisa dar paginas,
 // aquilo é so pra pessoa 
 // saber tipo qual numero ela
 // digita pra vender tal item, quando /// siiim, eu tendi, n vai muda pro usuario, so o codigo
 // é pra deixa o codigo menor, pq vc ta criando dois collector pra msm coisa
 // podia ser so 1
 // ele fala [1] crne de cachorro, e tu escreve 1 no chat. 
 /// ele vende a carne de cachorro. isso isso,é so pra ele saber as 
 // opç~poeshmmm tendi tendi, pq ai da ´ra aumentar o limite pra 2 mensagens,
 // e usar o mesmo coletor
 // o cara pode volta pra pagina anterior
 // imagina que cada opção é uma pagina
// PQ WIUDHAWUIDAWUDHAWUDAWHUDAWHDAWUHDAU

 // Deixa todos os comentarios que eu vou commitar com eles KSAKDSAKSEI
 // LA QUEM VER VAI RIR N SEI ASKDSAKD NÃO APAGUE :(((( aksdksadsakdask alzheimer vem forte 
 // eu excluo automatico, me segure

class PagesCollector extends MessageCollector {
  // gostou do nome ? wadjawudwuiadhawiodjaw ta tri
  constructor (channel, options, user, collectorOptions) {
    super(channel, this._filter, collectorOptions)
    // opções, exemplo no village seria: bruxa, ferreiro, hotel, guilda
    // nas opções nos podia separar por 
    this.options = options;
    // usuario que executou o comando
    this.user = user;
    // ativa vai ser as opções anteriores, tipo se a pessoa, ah esqueci
    this.oldOptions = null;
  }

  _filter (message) {
    if (message.author.id !== this.user.id) return
    // aqui nos vai checa as opções :thumbsup:
  }
}