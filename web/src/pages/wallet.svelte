<script lang="ts">
  import Button from '../components/Button.svelte';
  import WalletAccess from '../templates/WalletAccess.svelte';
  import {wallet, builtin, chain, transactions, balance} from '../stores/wallet';
  import App from '../App.svelte';
  import type {Contract} from '@ethersproject/contracts';

  let contractInterfaces:
    | {
        contract: Contract;
        name: string;
        functions: {
          name: string;
          inputs: {name: string; elemId: string}[];
          call: () => Promise<unknown>;
        }[];
      }[]
    | undefined;
  $: contractInterfaces =
    $chain.contracts &&
    Object.keys($chain.contracts)
      .filter((n: string) => !n.endsWith('_Implementation') && !n.endsWith('_Proxy'))
      .map((n) => ({contract: $chain.contracts[n], name: n}))
      .map(({contract, name}) => ({
        contract: contract,
        name: name,
        functions: contract.interface.fragments
          .filter((f) => f.type === 'function' && !(f as any).constant)
          .map((f) => {
            const inputs = f.inputs.map((i) => ({
              name: i.name,
              elemId: `${name}:${f.name}:${i.name}`,
            }));
            return {
              name: f.name,
              inputs,
              call: () => {
                const args = [];
                for (const input of inputs) {
                  args.push((document.getElementById(input.elemId) as HTMLInputElement).value);
                }
                return wallet.contracts[name].functions[f.format()](...args);
              },
            };
          }),
      }));
</script>

<WalletAccess>
  <div class="w-max-content flex justify-center">
    <Button
      class="m-4"
      label="probe builtin wallet (like metamask)"
      waitOnDisabled={$builtin.probing}
      disabled={$builtin.state === 'Ready' || $builtin.probing}
      on:click={() => builtin.probe()}>
      probe Builtin
    </Button>
    <Button class="m-4" label="select builtin wallet" on:click={() => wallet.connect('builtin')}>builtin</Button>
    <Button class="m-4" label="select portis wallet" on:click={() => wallet.connect('portis')}>portis</Button>
    <Button
      class="m-4"
      label="unlock wallet"
      waitOnDisabled={$wallet.unlocking}
      disabled={$wallet.state !== 'Locked' || $wallet.unlocking}
      on:click={() => wallet.unlock()}>
      unlock
    </Button>
    <Button
      class="m-4"
      label="disconnect from wallet"
      waitOnDisabled={$wallet.connecting}
      disabled={$wallet.state !== 'Ready' || $wallet.connecting}
      on:click={() => wallet.disconnect()}>
      disconnect
    </Button>
  </div>

  <div>
    <p><label for="wallet">Wallet</label> <span id="wallet">{JSON.stringify($wallet, null, ' ')}</span></p>

    <!-- <p><label for="builtin">Builtin</label> <span id="builtin">{JSON.stringify($builtin, null, ' ')}</span></p> -->

    {#if $chain.contracts}
      <h2 class="font-extrabold text-xl">Contracts</h2>

      {#each contractInterfaces as contractInterface}
        <h3 class="ml-1 font-semibold text-lg">{contractInterface.name}</h3>
        {#each contractInterface.functions as func}
          <form class="ml-4 w-max-content my-4">
            <label class="font-semibold" for={func.name}>{func.name}(</label>
            {#each func.inputs as input}
              <span class="">
                <label for={input.elemId}>{input.name}:</label>
                <input class="border-pink-600 border-2" id={input.elemId} />
              </span>
            {/each}
            <span>)</span>
            <Button
              secondary={true}
              class="w-max-content inline-block"
              id={func.name}
              label={func.name}
              on:click={() => func.call()}>
              Submit
            </Button>
          </form>
        {/each}
      {/each}
    {/if}

    <!-- <p><label for="chain">Chain</label> <span id="chain">{JSON.stringify($chain, null, '    ')}</span></p> -->

    <p>
      <label for="transactions">Transactions</label>
      <span id="transactions">{JSON.stringify($transactions, null, ' ')}</span>
    </p>

    <!-- <label for="balance">Balance</label>
  <p id="balance">{JSON.stringify($balance, null, ' ')}</p> -->
  </div>
</WalletAccess>
