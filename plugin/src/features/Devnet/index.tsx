import { useContext, useEffect, useState } from "react";
import { Card } from "../../components/Card";
import DevnetAccountSelector from "../../components/DevnetAccountSelector";
import DevnetSelector from "../../components/DevnetSelector";
import "./styles.css";
import { DevnetContext } from "../../contexts/DevnetContext";
import { ConnectionContext } from "../../contexts/ConnectionContext";
import { StarknetWindowObject, connect, disconnect } from "get-starknet";

const trimAddress = (adr: string) => {
  if (adr && adr.startsWith("0x")) {
    const len = adr.length;
    return `${adr.slice(0, 6)}...${adr.slice(len - 6, len)}`;
  }
  return adr;
};

const makeVoyagerLink = async (starknetObj?: StarknetWindowObject | null) => {
  if (starknetObj) {
    const chainId = await starknetObj?.account?.getChainId();
    if (chainId === "0x534e5f4d41494e") {
      return `https://goerli.voyager.online/contract/${starknetObj?.account?.address}`;
    } else {
      return `https://voyager.online/contract/${starknetObj?.account?.address}`;
    }
  }
  return "https://voyager.online";
};

interface ConnectionProps {}

function WalletAccountInfo() {
  const { starknetWindowObject, setStarknetWindowObject } =
    useContext(ConnectionContext);

  async function refreshWalletHandler() {
    disconnect({ clearLastWallet: true });
    setStarknetWindowObject(
      await connect({ modalMode: "alwaysAsk", modalTheme: "system" })
    );
  }

  const [voyagerLink, setVoyagerLink] = useState("");

  useEffect(() => {
    (async () => {
      const link = await makeVoyagerLink(starknetWindowObject);
      setVoyagerLink(link);
    })();
  }, [starknetWindowObject]);

  return (
    <div
      className="flex"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      <button className="btn btn-primary" onClick={refreshWalletHandler}>
        {" "}
        Refresh{" "}
      </button>
      <div className="wallet-wrapper">
        <img src={starknetWindowObject?.icon} alt="wallet icon" />
        <p className="text"> {starknetWindowObject?.id}</p>
      </div>
      <div className="account-wrapper">
        <p
          className="text account"
          title={starknetWindowObject?.account?.address}
        >
          {trimAddress(starknetWindowObject?.account?.address || "")}
        </p>
        <a href={voyagerLink} target="_blank" rel="noopnener noreferer">
          View on Voyager
        </a>
      </div>
    </div>
  );
}

function Devnet(_: ConnectionProps) {
  const { devnetEnv } = useContext(DevnetContext);
  return (
    <div className="starknet-connection-component mb-8">
      <Card header="Environment">
        <div className="flex">
          <label className="">Environment selection</label>
          <DevnetSelector />
        </div>
        <div className="flex">
          <label className="">Devnet account selection</label>
          {devnetEnv ? <DevnetAccountSelector /> : <WalletAccountInfo />}
        </div>
      </Card>
    </div>
  );
}

export { Devnet };
