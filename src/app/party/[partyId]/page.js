"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import MainLayout from "@/components/layout/MainLayout/MainLayout";
import Card from "@/components/ui/Card/Card";
import Button from "@/components/ui/Button/Button";
import Badge from "@/components/ui/Badge/Badge";
import Select from "@/components/forms/Select/Select";
import LoadingSpinner from "@/components/ui/LoadingSpinner/LoadingSpinner";
import SubmissionList from "@/components/party/SubmissionList/SubmissionList";
import VotingInterface from "@/components/party/VotingInterface/VotingInterface";
import { useToast } from "@/context/ToastContext";
import styles from "./page.module.scss";

export default function PartyPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const toast = useToast();
  const [party, setParty] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("time_desc");
  const [viewMode, setViewMode] = useState("view"); // 'view' or 'vote'

  useEffect(() => {
    fetchParty();
  }, [params.partyId]);

  useEffect(() => {
    if (party) {
      fetchSubmissions();
    }
  }, [party, sortBy]);

  const fetchParty = async () => {
    try {
      const response = await fetch(`/api/parties/${params.partyId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch party");
      }

      setParty(data.data.party);
    } catch (error) {
      toast.error(error.message);
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(
        `/api/parties/${params.partyId}/submissions?sort=${sortBy}`
      );
      const data = await response.json();

      if (response.ok) {
        setSubmissions(data.data.submissions);
      }
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    }
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/join/${party.code}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  const copyPartyCode = () => {
    navigator.clipboard.writeText(party.code);
    toast.success("Party code copied!");
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className={styles.loading}>
          <LoadingSpinner size='large' />
        </div>
      </MainLayout>
    );
  }

  if (!party) {
    return null;
  }

  const isCreator = session?.user?.id === party.creator?.toString();
  const deadline = new Date(party.deadline);
  const isExpired = deadline < new Date();
  const timeUntilDeadline = deadline - new Date();
  const daysUntilDeadline = Math.floor(
    timeUntilDeadline / (1000 * 60 * 60 * 24)
  );
  const hoursUntilDeadline = Math.floor(
    (timeUntilDeadline % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const shareUrl = `${window.location.origin}/join/${party.code}`;

  return (
    <MainLayout>
      <div className='container' style={{ padding: "50px 20px" }}>
        {/* Party Header */}
        <div className={styles.header}>
          <div>
            <div className={styles.headerTop}>
              <h1>{party.name}</h1>
              <Badge
                variant={party.status === "collecting" ? "success" : "default"}
              >
                {party.status === "collecting" ? "Active" : "Completed"}
              </Badge>
            </div>
            {party.theme && <p className={styles.theme}>{party.theme}</p>}
            {party.description && (
              <p className={styles.description}>{party.description}</p>
            )}
            <div className={styles.divider}>
              <span>Deadline</span>
            </div>
            <p className={styles.deadline}>
              {deadline.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className={styles.deadlineTime}>
              {deadline.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
            {!isExpired && (
              <Badge variant='info' size='small' style={{ marginTop: "8px" }}>
                {daysUntilDeadline > 0
                  ? `${daysUntilDeadline} day${
                      daysUntilDeadline !== 1 ? "s" : ""
                    } left`
                  : `${hoursUntilDeadline} hour${
                      hoursUntilDeadline !== 1 ? "s" : ""
                    } left`}
              </Badge>
            )}
          </div>
        </div>

        {/* Party Info Cards */}
        <div className={styles.infoGrid}>
          <Card>
            <h3>Party Code</h3>
            <div className={styles.code}>{party.code}</div>
            <Button
              variant='secondary'
              size='small'
              onClick={copyPartyCode}
              fullWidth
            >
              Copy Code
            </Button>
          </Card>

          <Card>
            <h3>Share This Party</h3>
            <p style={{ marginBottom: "20px", color: "#475532" }}>
              Invite friends to join by sharing this link
            </p>

            <div className={styles.shareSection}>
              <div className={styles.shareItem}>
                <label className={styles.shareLabel}>Join URL</label>
                <div className={styles.shareBox}>
                  <code className={styles.shareUrl}>{shareUrl}</code>
                  <Button variant='primary' onClick={copyShareLink}>
                    Copy Link
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {party.status === "collecting" && !isExpired && (
            <Button
              variant='primary'
              size='large'
              onClick={() => router.push(`/party/${params.partyId}/submit`)}
            >
              + Submit a Song
            </Button>
          )}

          {party.status === "revealed" && (
            <Button variant='primary' size='large'>
              View Playlist
            </Button>
          )}

          {isCreator && party.status === "collecting" && (
            <Button variant='secondary' size='large'>
              Reveal Playlist Early
            </Button>
          )}
        </div>

        {/* Submissions / Voting */}
        {submissions.length > 0 && (
          <Card padding='large' style={{ marginTop: "30px" }}>
            <div className={styles.submissionsHeader}>
              <h2>Submitted Songs ({submissions.length})</h2>
              <div className={styles.controls}>
                {party.settings.votingEnabled && (
                  <div className={styles.viewToggle}>
                    <Button
                      variant={viewMode === "view" ? "primary" : "ghost"}
                      size='small'
                      onClick={() => setViewMode("view")}
                    >
                      View
                    </Button>
                    <Button
                      variant={viewMode === "vote" ? "primary" : "ghost"}
                      size='small'
                      onClick={() => setViewMode("vote")}
                    >
                      Vote
                    </Button>
                  </div>
                )}
                {viewMode === "view" && (
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    options={[
                      { value: "time_desc", label: "Newest First" },
                      { value: "time_asc", label: "Oldest First" },
                      { value: "votes_desc", label: "Most Votes" },
                      { value: "votes_asc", label: "Least Votes" },
                    ]}
                  />
                )}
              </div>
            </div>

            {viewMode === "view" ? (
              <SubmissionList
                submissions={submissions}
                showSubmitter={party.settings.showSubmitters}
              />
            ) : (
              <VotingInterface
                submissions={submissions}
                partyId={params.partyId}
                votingSystem={party.settings.votingSystem}
                showSubmitter={party.settings.showSubmitters}
                onVotesSubmitted={fetchSubmissions}
              />
            )}
          </Card>
        )}

        {/* Settings Preview (for creator) */}
        {isCreator && (
          <Card padding='large' style={{ marginTop: "30px" }}>
            <h2>Party Settings</h2>
            <div className={styles.settingsGrid}>
              <div className={styles.setting}>
                <span className={styles.settingLabel}>
                  Max songs per person:
                </span>
                <span>{party.settings.maxSongsPerUser}</span>
              </div>
              <div className={styles.setting}>
                <span className={styles.settingLabel}>
                  Min songs to reveal:
                </span>
                <span>{party.settings.minSongsToReveal}</span>
              </div>
              <div className={styles.setting}>
                <span className={styles.settingLabel}>Allow anonymous:</span>
                <Badge
                  variant={
                    party.settings.allowAnonymous ? "success" : "default"
                  }
                  size='small'
                >
                  {party.settings.allowAnonymous ? "Yes" : "No"}
                </Badge>
              </div>
              <div className={styles.setting}>
                <span className={styles.settingLabel}>Voting enabled:</span>
                <Badge
                  variant={party.settings.votingEnabled ? "success" : "default"}
                  size='small'
                >
                  {party.settings.votingEnabled ? "Yes" : "No"}
                </Badge>
              </div>
              <div className={styles.setting}>
                <span className={styles.settingLabel}>Comments enabled:</span>
                <Badge
                  variant={
                    party.settings.commentsEnabled ? "success" : "default"
                  }
                  size='small'
                >
                  {party.settings.commentsEnabled ? "Yes" : "No"}
                </Badge>
              </div>
              <div className={styles.setting}>
                <span className={styles.settingLabel}>Show submitters:</span>
                <Badge
                  variant={
                    party.settings.showSubmitters ? "success" : "default"
                  }
                  size='small'
                >
                  {party.settings.showSubmitters ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
