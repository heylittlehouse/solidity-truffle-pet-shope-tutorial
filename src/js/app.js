App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return App.initWeb3();
  },

  initWeb3: function() {
    //Is there an injected web3 instance such as Mist or Chrome w/ MetaMask?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      //If no injected web3 instance is detected, fall back to Ganache
      //Fine for dev environments, insecure for production
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  //Instantiate our smart contract so web3 knows where to find it and how it works.
  //truffle-contract keeps information about the contract in sync with migrations, 
  //so you don't need to change the contract's deployed address manually.
  initContract: function() {
    $.getJSON('Adoption.json', function(data) {
      //Get the necessary contract artifact file and instantiate it with truffle-contract
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);

      //Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);

      //Use our contract to retrieve and mark the adopted pets
      return App.markAdopted();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function(adopters, account) {
    var adoptionInstance;

    //Finds the deployed instance of the adoption contract
    App.contracts.Adoption.deployed().then(function(instance){
      adoptionInstance = instance;
      //calls the getAdopters() funct 
      //Using call() allows us to read data from the blockchain without having to send a full transaction, 
      //meaning we won't have to spend any ether.
      return adoptionInstance.getAdopters.call();
    }).then(function(adopters){
      for (var i = adopters.length - 1; i >= 0; i--) {
        //Since the array contains address types, 
        //Ethereum initializes the array with 16 empty addresses. 
        //This is why we check for an empty address string rather than null or other falsey value.
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
        }
      }
    }).catch(function(err){
      console.log(err.message);
    })
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    /*
     * Replace me...
     */
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
