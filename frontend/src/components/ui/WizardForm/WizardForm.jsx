// ============================================
// WIZARD FORM COMPONENT
// Reusable multi-step form wrapper
// ============================================

import { useEffect, useRef, useState } from "react";
import StepIndicator from "../StepIndicator/StepIndicator";
import './WizardForm.scss';

const WizardForm = ({ 
  steps, 
  initialStep = 1,
  onSubmit,
  onCancel,
  children,
  submitLabel = "Submit",
  allowStepNavigation = false,
  isSubmitting = false,
  submitCooldownMs = 0,
  leftSlot = null
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [internalSubmitting, setInternalSubmitting] = useState(false);
  const [cooldownActive, setCooldownActive] = useState(false);
  const cooldownTimeoutRef = useRef(null);
  const totalSteps = steps.length;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepNumber) => {
    if (allowStepNavigation) {
      setCurrentStep(stepNumber);
    }
  };

  // Prevent form submit on Enter key – submit only when "Complete Visit" is clicked
  const handleFormSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const handleCompleteClick = () => {
    if (!onSubmit) return;
    if (isSubmitting || internalSubmitting || cooldownActive) return;

    if (submitCooldownMs > 0) {
      setCooldownActive(true);
      if (cooldownTimeoutRef.current) clearTimeout(cooldownTimeoutRef.current);
      cooldownTimeoutRef.current = setTimeout(() => {
        setCooldownActive(false);
      }, submitCooldownMs);
    }

    setInternalSubmitting(true);
    Promise.resolve(onSubmit()).finally(() => setInternalSubmitting(false));
  };

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;
  const disableActions = isSubmitting || internalSubmitting || cooldownActive;

  useEffect(() => {
    return () => {
      if (cooldownTimeoutRef.current) clearTimeout(cooldownTimeoutRef.current);
    };
  }, []);

  return (
    <form onSubmit={handleFormSubmit} className="wizard-form">
      <StepIndicator 
        steps={steps} 
        currentStep={currentStep}
        onStepClick={allowStepNavigation ? handleStepClick : undefined}
      />
      
      <div className="wizard-content">
        {children(currentStep)}
      </div>

      <div className="wizard-navigation">
        <div className="wizard-nav-left">
          {leftSlot}
          {onCancel && (
            <button
              type="button"
              className="btn-step btn-cancel"
              onClick={onCancel}
              disabled={disableActions}
            >
              Cancel
            </button>
          )}
        </div>

        <div className="wizard-nav-buttons">
          {!isFirstStep && (
            <button
              type="button"
              className="btn-step btn-prev"
              onClick={handlePrevious}
              disabled={disableActions}
            >
              ← Previous
            </button>
          )}

          {!isLastStep ? (
            <button
              type="button"
              className="btn-step btn-next"
              onClick={handleNext}
              disabled={disableActions}
            >
              Next →
            </button>
          ) : (
            <button
              type="button"
              className="btn-step btn-submit"
              onClick={handleCompleteClick}
              disabled={disableActions}
            >
              {submitLabel}
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default WizardForm;
