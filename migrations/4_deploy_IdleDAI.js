var IdleToken = artifacts.require("./IdleToken.sol");
var IdleRebalancerV2 = artifacts.require("./IdleRebalancerV2.sol");
var IdlePriceCalculator = artifacts.require("./IdlePriceCalculator.sol");
var IdleCompoundV2 = artifacts.require("./IdleCompoundV2.sol");
var IdleFulcrumV2 = artifacts.require("./IdleFulcrumV2.sol");
var IdleFactory = artifacts.require("./IdleFactory.sol");

const cDAI = {
  'live': '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
  'live-fork': '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643', // needed for truffle
  'kovan': '0xe7bc397dbd069fc7d0109c0636d06888bb50668c',
  'kovan-fork': '0xe7bc397dbd069fc7d0109c0636d06888bb50668c', // needed for truffle
  'local': '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
  'local-fork': '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
  'test': '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
  'coverage': '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',

  'deploy': '0xe7bc397dbd069fc7d0109c0636d06888bb50668c', // used for truffle Teams deploy, now kovan
};
const iDAI = {
  'live': '0x493C57C4763932315A328269E1ADaD09653B9081',
  'live-fork': '0x493C57C4763932315A328269E1ADaD09653B9081', // needed for truffle
  'kovan': '0x6c1e2b0f67e00c06c8e2be7dc681ab785163ff4d',
  'kovan-fork': '0x6c1e2b0f67e00c06c8e2be7dc681ab785163ff4d', // needed for truffle
  'local': '0x493C57C4763932315A328269E1ADaD09653B9081',
  'local-fork': '0x493C57C4763932315A328269E1ADaD09653B9081',
  'test': '0x493C57C4763932315A328269E1ADaD09653B9081',
  'coverage': '0x493C57C4763932315A328269E1ADaD09653B9081',

  'deploy': '0x6c1e2b0f67e00c06c8e2be7dc681ab785163ff4d', // used for truffle Teams deploy, now kovan
};
const DAI = {
  'live': '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  'live-fork': '0x6B175474E89094C44Da98b954EedeAC495271d0F', // needed for truffle
  'kovan': '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa',
  'kovan-fork': '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa', // needed for truffle
  'local': '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  'local-fork': '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  'test': '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  'coverage': '0x6B175474E89094C44Da98b954EedeAC495271d0F',

  'deploy': '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa', // used for truffle Teams deploy, now kovan
};

module.exports = async function(deployer, network, accounts) {
  if (network === 'test') {
    return;
  }
  console.log('Network', network);
  console.log('cDAI address: ', cDAI[network]);
  console.log('iDAI address: ', iDAI[network]);
  console.log('DAI address: ', DAI[network]);
  console.log('##################');
  await deployer.deploy(IdleCompoundV2, cDAI[network], DAI[network]);
  await deployer.deploy(IdleFulcrumV2, iDAI[network], DAI[network]);
  await deployer.deploy(IdleRebalancerV2,
    cDAI[network], iDAI[network],
    IdleCompoundV2.address, IdleFulcrumV2.address
  );

  const Factory = await IdleFactory.at(IdleFactory.address);
  const IdleDAIAddress = await Factory.newIdleToken.call(
    'IdleDAI',
    'IDLEDAI',
    18,
    DAI[network], cDAI[network], iDAI[network],
    IdleRebalancerV2.address,
    IdlePriceCalculator.address,
    IdleCompoundV2.address, IdleFulcrumV2.address
  );
  await Factory.newIdleToken(
    'IdleDAI',
    'IDLEDAI',
    18,
    DAI[network], cDAI[network], iDAI[network],
    IdleRebalancerV2.address,
    IdlePriceCalculator.address,
    IdleCompoundV2.address, IdleFulcrumV2.address
  );
  await Factory.setTokenOwnershipAndPauser(IdleDAIAddress);

  console.log('[DAI] IdleCompoundV2 address:', IdleCompoundV2.address);
  console.log('[DAI] IdleFulcrumV2  address:', IdleFulcrumV2.address);
  console.log('[DAI] IdleRebalancerV2  address:', IdleRebalancerV2.address);
  console.log('#### IdleDAIAddress: ', IdleDAIAddress);

  (await IdleRebalancerV2.at(IdleRebalancerV2.address)).setIdleToken(IdleDAIAddress);
  (await IdleCompoundV2.at(IdleCompoundV2.address)).setIdleToken(IdleDAIAddress);
  (await IdleFulcrumV2.at(IdleFulcrumV2.address)).setIdleToken(IdleDAIAddress);
};
