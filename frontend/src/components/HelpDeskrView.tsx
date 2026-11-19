import { useState } from 'react';
import type { TicketRecord } from '../types';
import { APPS } from '../data/mockData';
import { Modal } from './Modal';

interface HelpDeskrViewProps {
  tickets: TicketRecord[];
  onAddTicket: (ticket: TicketRecord) => void;
  onUpdateTicketStatus: (index: number, newStatus: string) => void;
  showMessage: (msg: string) => void;
}

export function HelpDeskrView({
  tickets,
  onAddTicket,
  onUpdateTicketStatus,
  showMessage,
}: HelpDeskrViewProps) {
  const [activeTab, setActiveTab] = useState('Tickets');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createRequester, setCreateRequester] = useState('');
  const [createSubject, setCreateSubject] = useState('');
  const [createPriority, setCreatePriority] = useState('Normal');

  const [selectedTicketIndex, setSelectedTicketIndex] = useState<number | null>(null);
  const [ticketNewStatus, setTicketNewStatus] = useState('Open');

  // Comment state
  const [commentType, setCommentType] = useState('Public comment');
  const [commentText, setCommentText] = useState('');

  // Attachments state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Integration API state
  const [apiBasePath, setApiBasePath] = useState('/api/v1/support');
  const [apiActor, setApiActor] = useState('tb-sync-svc');
  const [apiAccessStatus, setApiAccessStatus] = useState('Enabled');

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createRequester.trim() || !createSubject.trim()) {
      showMessage('Requester and subject are required.');
      return;
    }
    const newId = `HD-${Math.floor(2050 + Math.random() * 50)}`;
    onAddTicket([
      newId,
      createSubject.trim(),
      createRequester.trim(),
      createPriority,
      'Open',
      'Support Queue',
    ]);
    setIsCreateOpen(false);
    setCreateRequester('');
    setCreateSubject('');
    setCreatePriority('Normal');
    showMessage('Ticket created in demo data.');
  };

  const handleOpenTicketModal = (index: number) => {
    setSelectedTicketIndex(index);
    setTicketNewStatus(tickets[index][4]);
  };

  const handleSaveTicketStatus = () => {
    if (selectedTicketIndex !== null) {
      onUpdateTicketStatus(selectedTicketIndex, ticketNewStatus);
      setSelectedTicketIndex(null);
      showMessage('Ticket updated.');
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return t.some((field) => field.toLowerCase().includes(q));
  });

  return (
    <div>
      <div className="head">
        <div>
          <div className="eyebrow">BUSINESS APPLICATION</div>
          <h1>{APPS.help.name}</h1>
          <p className="muted">{APPS.help.desc}</p>
        </div>
        <span className="pill">● Simulated system</span>
      </div>

      <div className="tabs">
        {APPS.help.tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={tab === activeTab ? 'active' : ''}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div id="body">
        {activeTab === 'Tickets' && (
          <div className="panel">
            <div className="toolbar">
              <b>Support tickets</b>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  type="button"
                  className="btn primary"
                  onClick={() => setIsCreateOpen(true)}
                >
                  ＋ Create ticket
                </button>
              </div>
            </div>

            <div className="scroll">
              <table>
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Subject</th>
                    <th>Requester</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assigned to</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((row, i) => (
                    <tr key={row[0]}>
                      <td><b>{row[0]}</b></td>
                      <td>{row[1]}</td>
                      <td>{row[2]}</td>
                      <td>
                        <span
                          className={`badge ${
                            row[3] === 'High' ? 'risk' : row[3] === 'Low' ? 'ok' : 'warn'
                          }`}
                        >
                          {row[3]}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            row[4] === 'Resolved' ? 'ok' : row[4] === 'Open' ? 'risk' : 'warn'
                          }`}
                        >
                          {row[4]}
                        </span>
                      </td>
                      <td>{row[5]}</td>
                      <td>
                        <button
                          type="button"
                          className="btn ghost"
                          onClick={() => handleOpenTicketModal(i)}
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredTickets.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>
                        No tickets matching search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Comments & Notes' && (
          <div className="grid two">
            <div className="panel">
              <h3>Ticket conversation · HD-2048</h3>
              <div className="activity">
                <b>Maya Chen · Customer</b>
                <div className="small">Shipment documents page returns an access error.</div>
              </div>
              <div className="activity">
                <b>Support Queue · Public reply</b>
                <div className="small">We are checking document permissions.</div>
              </div>
              <div className="activity">
                <b>Finance Support · Internal note</b>
                <div className="small">Verify vendor folder permission changes.</div>
              </div>
            </div>

            <div className="panel">
              <h3>Add comment / internal note</h3>
              <div className="field">
                <label>TYPE</label>
                <select
                  value={commentType}
                  onChange={(e) => setCommentType(e.target.value)}
                >
                  <option>Public comment</option>
                  <option>Internal note</option>
                </select>
              </div>
              <div className="field">
                <label>MESSAGE</label>
                <textarea
                  rows={5}
                  placeholder="Write update..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="btn primary"
                onClick={() => {
                  if (!commentText.trim()) {
                    showMessage('Please enter a comment message.');
                    return;
                  }
                  showMessage('Comment added to demo history.');
                  setCommentText('');
                }}
              >
                Add comment
              </button>
            </div>
          </div>
        )}

        {activeTab === 'Attachments' && (
          <div className="panel">
            <h3>Ticket attachments</h3>
            <p className="muted">Select a local file to display its name in the prototype. It will not be uploaded.</p>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', margin: '14px 0' }}>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
              />
              <button
                type="button"
                className="btn primary"
                onClick={() => {
                  if (selectedFile) {
                    showMessage(`Attachment registered in demo: ${selectedFile.name}`);
                  } else {
                    showMessage('Choose a file first.');
                  }
                }}
              >
                Attach file
              </button>
            </div>
            <div className="row">
              <b>shipment_manifest_sample.pdf</b>
              <span className="badge">HD-2048 · PDF</span>
            </div>
          </div>
        )}

        {activeTab === 'Integration API' && (
          <div className="grid two">
            <div className="panel">
              <h3>Integration API</h3>
              <div className="field">
                <label>API BASE PATH</label>
                <input
                  value={apiBasePath}
                  onChange={(e) => setApiBasePath(e.target.value)}
                />
              </div>
              <div className="field">
                <label>INTEGRATION ACTOR</label>
                <input
                  value={apiActor}
                  onChange={(e) => setApiActor(e.target.value)}
                />
              </div>
              <div className="field">
                <label>ACCESS STATUS</label>
                <select
                  value={apiAccessStatus}
                  onChange={(e) => setApiAccessStatus(e.target.value)}
                >
                  <option>Enabled</option>
                  <option>Disabled</option>
                </select>
              </div>
              <button
                type="button"
                className="btn primary"
                onClick={() => showMessage('API configuration saved in demo.')}
              >
                Save configuration
              </button>
            </div>

            <div className="panel">
              <h3>API activity</h3>
              <div className="activity">
                <b>GET /tickets</b>
                <div className="small">200 · 12 records</div>
              </div>
              <div className="activity">
                <b>POST /exports</b>
                <div className="small">202 · Export queued</div>
              </div>
              <div className="activity">
                <b>DELETE /exports/5419</b>
                <div className="small">204 · Export removed</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Access Control' && (
          <div className="panel">
            <h3>Role-based access control</h3>
            <div className="scroll">
              <table>
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Tickets</th>
                    <th>Internal notes</th>
                    <th>Attachments</th>
                    <th>Audit</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Support Agent', 'Assigned', 'Own tickets', 'Yes', 'Limited'],
                    ['Support Manager', 'All', 'Yes', 'Yes', 'Yes'],
                    ['Customer', 'Own only', 'No', 'Own only', 'No'],
                  ].map((r, i) => (
                    <tr key={i}>
                      <td><b>{r[0]}</b></td>
                      <td>{r[1]}</td>
                      <td>{r[2]}</td>
                      <td>{r[3]}</td>
                      <td>{r[4]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Audit History' && (
          <div className="panel">
            <h3>Audit history</h3>
            <div className="scroll">
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Actor</th>
                    <th>Event</th>
                    <th>Object</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['19 Nov 08:12', 'support.agent', 'ticket.assign', 'HD-2048', 'Success'],
                    ['19 Nov 08:10', 'support.manager', 'ticket.view', 'HD-2048', 'Success'],
                    ['18 Nov 17:42', 'tb-sync-svc', 'ticket.sync', 'Batch 8821', 'Success'],
                  ].map((r, i) => (
                    <tr key={i}>
                      <td>{r[0]}</td>
                      <td><b>{r[1]}</b></td>
                      <td><code>{r[2]}</code></td>
                      <td>{r[3]}</td>
                      <td><span className="badge ok">{r[4]}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      <Modal
        title="Create support ticket"
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      >
        <form onSubmit={handleCreateTicket}>
          <div className="field">
            <label>REQUESTER</label>
            <input
              value={createRequester}
              onChange={(e) => setCreateRequester(e.target.value)}
              placeholder="e.g. Maya Chen"
              autoFocus
            />
          </div>
          <div className="field">
            <label>SUBJECT</label>
            <input
              value={createSubject}
              onChange={(e) => setCreateSubject(e.target.value)}
              placeholder="e.g. Shipment documents access issue"
            />
          </div>
          <div className="field">
            <label>PRIORITY</label>
            <select
              value={createPriority}
              onChange={(e) => setCreatePriority(e.target.value)}
            >
              <option>Normal</option>
              <option>High</option>
              <option>Low</option>
            </select>
          </div>
          <button type="submit" className="btn primary full">
            Create ticket
          </button>
        </form>
      </Modal>

      {/* View Ticket Modal */}
      {selectedTicketIndex !== null && tickets[selectedTicketIndex] && (
        <Modal
          title={tickets[selectedTicketIndex][0]}
          isOpen={true}
          onClose={() => setSelectedTicketIndex(null)}
        >
          <div>
            <p><b>{tickets[selectedTicketIndex][1]}</b></p>
            <p className="muted">Requester: {tickets[selectedTicketIndex][2]}</p>
            <div className="field">
              <label>STATUS</label>
              <select
                value={ticketNewStatus}
                onChange={(e) => setTicketNewStatus(e.target.value)}
              >
                <option>Open</option>
                <option>In progress</option>
                <option>Resolved</option>
              </select>
            </div>
            <button
              type="button"
              className="btn primary full"
              onClick={handleSaveTicketStatus}
            >
              Save
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
