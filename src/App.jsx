import { useState, useCallback } from 'react'
import { ethers } from 'ethers'
import VotingABI from '../onchain/artifacts/contracts/Voting.sol/Voting.json'
import './App.css'

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || ''

export default function App() {
  const [account, setAccount]         = useState(null)
  const [contract, setContract]       = useState(null)
  const [isOwner, setIsOwner]         = useState(false)
  const [isMember, setIsMember]       = useState(false)
  const [proposals, setProposals]     = useState([])
  const [votedIds, setVotedIds]       = useState(new Set())
  const [proposalText, setProposalText] = useState('')
  const [memberAddr, setMemberAddr]   = useState('')
  const [status, setStatus]           = useState('')
  const [busy, setBusy]               = useState(false)

  const fetchProposals = useCallback(async (c, addr) => {
    const countBN = await c.proposalCount()
    const n = countBN.toNumber()
    const list = []
    const voted = new Set()
    for (let i = 1; i <= n; i++) {
      const p = await c.proposals(i)
      const [vFor, vAgainst] = await c.getProposalResults(i)
      list.push({
        id: i,
        description: p.description,
        votesFor: vFor.toNumber(),
        votesAgainst: vAgainst.toNumber(),
      })
      if (addr && await c.hasVotedOn(i, addr)) voted.add(i)
    }
    setProposals(list)
    setVotedIds(voted)
  }, [])

  async function connect() {
    if (!window.ethereum) return setStatus('MetaMask not found — please install it.')
    if (!CONTRACT_ADDRESS) return setStatus('Set VITE_CONTRACT_ADDRESS in .env.local, then restart the dev server.')
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      await provider.send('eth_requestAccounts', [])
      const signer = provider.getSigner()
      const addr = await signer.getAddress()
      const c = new ethers.Contract(CONTRACT_ADDRESS, VotingABI.abi, signer)
      const owner = await c.owner()
      setAccount(addr)
      setContract(c)
      setIsOwner(owner.toLowerCase() === addr.toLowerCase())
      setIsMember(await c.members(addr))
      await fetchProposals(c, addr)
      setStatus('')
    } catch (e) {
      setStatus(e.reason || e.message)
    }
  }

  async function addMember() {
    if (!ethers.utils.isAddress(memberAddr)) return setStatus('Invalid Ethereum address.')
    setBusy(true)
    try {
      await (await contract.addMember(memberAddr)).wait()
      setIsMember(await contract.members(account))
      setStatus(`Member added: ${memberAddr.slice(0, 8)}…`)
      setMemberAddr('')
    } catch (e) { setStatus(e.reason || e.message) }
    setBusy(false)
  }

  async function submitProposal() {
    if (!proposalText.trim()) return setStatus('Enter a proposal description.')
    setBusy(true)
    try {
      await (await contract.createProposal(proposalText.trim())).wait()
      setProposalText('')
      await fetchProposals(contract, account)
      setStatus('')
    } catch (e) { setStatus(e.reason || e.message) }
    setBusy(false)
  }

  async function castVote(id, support) {
    setBusy(true)
    try {
      await (await contract.vote(id, support)).wait()
      await fetchProposals(contract, account)
      setStatus('')
    } catch (e) { setStatus(e.reason || e.message) }
    setBusy(false)
  }

  const short = a => `${a.slice(0, 6)}…${a.slice(-4)}`

  return (
    <div className="app">
      <header>
        <h1>DAO Voting</h1>
        {account
          ? <span className="chip">
              {short(account)}
              {isMember && <em> Member</em>}
              {isOwner  && <em> Owner</em>}
            </span>
          : <button onClick={connect}>Connect Wallet</button>
        }
      </header>

      {status && <p className="banner">{status}</p>}

      {account && isOwner && (
        <section>
          <h2>Add Member</h2>
          <div className="row">
            <input
              placeholder="0x address"
              value={memberAddr}
              onChange={e => setMemberAddr(e.target.value)}
            />
            <button onClick={addMember} disabled={busy}>Add</button>
          </div>
          {!isMember && <p className="hint">You are the owner but not a member — add your own address to create proposals.</p>}
        </section>
      )}

      {account && isMember && (
        <section>
          <h2>New Proposal</h2>
          <div className="row">
            <input
              placeholder="Describe your proposal…"
              value={proposalText}
              onChange={e => setProposalText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitProposal()}
            />
            <button onClick={submitProposal} disabled={busy}>Submit</button>
          </div>
        </section>
      )}

      <section>
        <h2>Proposals {proposals.length > 0 && `(${proposals.length})`}</h2>
        {proposals.length === 0
          ? <p className="empty">
              {account ? 'No proposals yet.' : 'Connect your wallet to load proposals.'}
            </p>
          : <div className="grid">
              {proposals.map(p => (
                <div key={p.id} className="card">
                  <p className="desc">{p.description}</p>
                  <div className="tally">
                    <span className="for">For {p.votesFor}</span>
                    <span className="against">Against {p.votesAgainst}</span>
                  </div>
                  {account && isMember && !votedIds.has(p.id) && (
                    <div className="row">
                      <button className="btn-for"     onClick={() => castVote(p.id, true)}  disabled={busy}>Vote For</button>
                      <button className="btn-against" onClick={() => castVote(p.id, false)} disabled={busy}>Vote Against</button>
                    </div>
                  )}
                  {votedIds.has(p.id) && <p className="voted-label">You voted</p>}
                </div>
              ))}
            </div>
        }
      </section>
    </div>
  )
}