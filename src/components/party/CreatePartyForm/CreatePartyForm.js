'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/forms/Input/Input';
import TextArea from '@/components/forms/TextArea/TextArea';
import Select from '@/components/forms/Select/Select';
import Toggle from '@/components/forms/Toggle/Toggle';
import DateTimePicker from '@/components/forms/DateTimePicker/DateTimePicker';
import Button from '@/components/ui/Button/Button';
import Card from '@/components/ui/Card/Card';
import { useToast } from '@/context/ToastContext';
import styles from './CreatePartyForm.module.scss';

export default function CreatePartyForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: '',
    theme: '',
    description: '',
    
    // Step 2: Rules & Limits
    deadline: '',
    maxSongsPerUser: 3,
    minSongsToReveal: 3,
    
    // Step 3: Privacy Settings
    isPublic: true,
    allowAnonymous: true,
    allowLateSubmissions: false,
    showSubmitters: false,
    
    // Step 4: Voting & Comments
    votingEnabled: true,
    votingSystem: 'upvote',
    commentsEnabled: true,
  });
  
  const [errors, setErrors] = useState({});
  const router = useRouter();
  const toast = useToast();

  const totalSteps = 4;

  // Get minimum deadline (3 hours from now)
  const getMinDeadline = () => {
    const date = new Date();
    date.setHours(date.getHours() + 3);
    return date.toISOString().slice(0, 16);
  };

  // Get maximum deadline (30 days from now)
  const getMaxDeadline = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().slice(0, 16);
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.name || formData.name.length < 3) {
        newErrors.name = 'Party name must be at least 3 characters';
      }
      if (formData.name && formData.name.length > 50) {
        newErrors.name = 'Party name must be less than 50 characters';
      }
      if (formData.theme && formData.theme.length > 200) {
        newErrors.theme = 'Theme must be less than 200 characters';
      }
      if (formData.description && formData.description.length > 500) {
        newErrors.description = 'Description must be less than 500 characters';
      }
    }

    if (step === 2) {
      if (!formData.deadline) {
        newErrors.deadline = 'Deadline is required';
      } else if (new Date(formData.deadline) <= new Date()) {
        newErrors.deadline = 'Deadline must be in the future';
      }
      
      if (formData.maxSongsPerUser < 1 || formData.maxSongsPerUser > 10) {
        newErrors.maxSongsPerUser = 'Must be between 1 and 10';
      }
      
      if (formData.minSongsToReveal < 1) {
        newErrors.minSongsToReveal = 'Must be at least 1';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/parties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          theme: formData.theme,
          description: formData.description,
          deadline: formData.deadline,
          settings: {
            maxSongsPerUser: parseInt(formData.maxSongsPerUser),
            minSongsToReveal: parseInt(formData.minSongsToReveal),
            isPublic: formData.isPublic,
            allowAnonymous: formData.allowAnonymous,
            allowLateSubmissions: formData.allowLateSubmissions,
            showSubmitters: formData.showSubmitters,
            votingEnabled: formData.votingEnabled,
            votingSystem: formData.votingSystem,
            commentsEnabled: formData.commentsEnabled,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create party');
      }

      toast.success('Party created successfully! 🎉');
      router.push(`/party/${data.data.partyId}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className={styles.container}>
      {/* Progress Bar */}
      <div className={styles.progressBar}>
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`${styles.progressStep} ${
              step <= currentStep ? styles.active : ''
            } ${step < currentStep ? styles.completed : ''}`}
          >
            <div className={styles.progressCircle}>{step}</div>
            <span className={styles.progressLabel}>
              {step === 1 && 'Basic Info'}
              {step === 2 && 'Rules'}
              {step === 3 && 'Privacy'}
              {step === 4 && 'Voting'}
            </span>
          </div>
        ))}
      </div>

      <Card padding="large">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className={styles.step}>
            <h2>Basic Information</h2>
            <p className={styles.stepDescription}>
              Give your party a name and describe what kind of music you're looking for
            </p>

            <div className={styles.fields}>
              <Input
                label="Party Name"
                placeholder="Summer Road Trip Playlist"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                error={errors.name}
                fullWidth
                required
                icon="🎉"
              />

              <Input
                label="Theme / Prompt"
                placeholder="Songs that make you want to hit the road"
                value={formData.theme}
                onChange={(e) => updateFormData('theme', e.target.value)}
                error={errors.theme}
                helperText="Optional: Give people a theme to follow"
                fullWidth
                icon="🎵"
              />

              <TextArea
                label="Description"
                placeholder="Let's build the ultimate summer road trip playlist! Share your favorite driving songs."
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                error={errors.description}
                maxLength={500}
                showCount
                rows={4}
                helperText="Optional: Add more context about your party"
                fullWidth
              />
            </div>
          </div>
        )}

        {/* Step 2: Rules & Limits */}
        {currentStep === 2 && (
          <div className={styles.step}>
            <h2>Rules & Limits</h2>
            <p className={styles.stepDescription}>
              Set the deadline and submission rules for your party
            </p>

            <div className={styles.fields}>
              <DateTimePicker
                label="Submission Deadline"
                value={formData.deadline}
                onChange={(e) => updateFormData('deadline', e.target.value)}
                min={getMinDeadline()}
                max={getMaxDeadline()}
                error={errors.deadline}
                helperText="When should submissions close?"
                fullWidth
                required
              />

              <Select
                label="Songs Per Person"
                value={formData.maxSongsPerUser}
                onChange={(e) => updateFormData('maxSongsPerUser', e.target.value)}
                options={[
                  { value: 1, label: '1 song' },
                  { value: 2, label: '2 songs' },
                  { value: 3, label: '3 songs' },
                  { value: 5, label: '5 songs' },
                  { value: 10, label: '10 songs' },
                ]}
                helperText="Maximum songs each person can submit"
                fullWidth
              />

              <Input
                label="Minimum Songs to Reveal"
                type="number"
                min="1"
                max="100"
                value={formData.minSongsToReveal}
                onChange={(e) => updateFormData('minSongsToReveal', e.target.value)}
                error={errors.minSongsToReveal}
                helperText="How many songs needed before the playlist is revealed?"
                fullWidth
              />
            </div>
          </div>
        )}

        {/* Step 3: Privacy Settings */}
        {currentStep === 3 && (
          <div className={styles.step}>
            <h2>Privacy Settings</h2>
            <p className={styles.stepDescription}>
              Control who can join and what information is visible
            </p>

            <div className={styles.fields}>
              <Toggle
                label="Public Party"
                checked={formData.isPublic}
                onChange={(e) => updateFormData('isPublic', e.target.checked)}
                helperText="Anyone with the link can join"
              />

              <Toggle
                label="Allow Anonymous Users"
                checked={formData.allowAnonymous}
                onChange={(e) => updateFormData('allowAnonymous', e.target.checked)}
                helperText="People can join without creating an account"
              />

              <Toggle
                label="Allow Late Submissions"
                checked={formData.allowLateSubmissions}
                onChange={(e) => updateFormData('allowLateSubmissions', e.target.checked)}
                helperText="People can still submit songs after the deadline"
              />

              <Toggle
                label="Show Who Submitted What"
                checked={formData.showSubmitters}
                onChange={(e) => updateFormData('showSubmitters', e.target.checked)}
                helperText="Display usernames next to song submissions"
              />
            </div>
          </div>
        )}

        {/* Step 4: Voting & Comments */}
        {currentStep === 4 && (
          <div className={styles.step}>
            <h2>Voting & Comments</h2>
            <p className={styles.stepDescription}>
              Configure how people can interact with submissions
            </p>

            <div className={styles.fields}>
              <Toggle
                label="Enable Voting"
                checked={formData.votingEnabled}
                onChange={(e) => updateFormData('votingEnabled', e.target.checked)}
                helperText="Let people vote on their favorite songs"
              />

              {formData.votingEnabled && (
                <Select
                  label="Voting System"
                  value={formData.votingSystem}
                  onChange={(e) => updateFormData('votingSystem', e.target.value)}
                  options={[
                    { value: 'upvote', label: 'Upvote Only' },
                    { value: 'upvote-downvote', label: 'Upvote & Downvote' },
                  ]}
                  helperText="How should voting work?"
                  fullWidth
                />
              )}

              <Toggle
                label="Enable Comments"
                checked={formData.commentsEnabled}
                onChange={(e) => updateFormData('commentsEnabled', e.target.checked)}
                helperText="Allow people to comment on songs"
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className={styles.actions}>
          {currentStep > 1 && (
            <Button
              variant="secondary"
              onClick={handleBack}
              disabled={isLoading}
            >
              Back
            </Button>
          )}

          <div style={{ flex: 1 }} />

          {currentStep < totalSteps ? (
            <Button
              variant="primary"
              onClick={handleNext}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={isLoading}
            >
              Create Party
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
