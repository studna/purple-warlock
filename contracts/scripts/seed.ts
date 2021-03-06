import {getUnnamedAccounts, ethers} from '@nomiclabs/buidler';

const messages = ['Hello', '你好', 'سلام', 'здравствуйте', 'Habari', 'Bonjour', 'नमस्ते'];

// TODO move to util
const waitFor = <T>(p: Promise<{wait: () => Promise<T>}>) => p.then((tx) => tx.wait());

async function main() {
  const others = await getUnnamedAccounts();
  for (let i = 0; i < messages.length; i++) {
    const sender = others[i];
    if (sender) {
      const gobelinRegistryContract = await ethers.getContract('GobelinRegistry', sender);
      await waitFor(gobelinRegistryContract.setMessage(messages[i]));
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
