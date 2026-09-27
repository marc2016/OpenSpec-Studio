import React from 'react';
import Icon from '@mdi/react';
import {
  mdiCreation,
  mdiConsole,
  mdiRocketLaunchOutline,
  mdiCheckCircle,
  mdiArrowRight
} from '@mdi/js';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { OpenSpecLogo } from './ui/OpenSpecLogo';
import { useTranslation } from '../i18n';

interface OnboardingViewProps {
  onInitProject: () => void;
  onInstallCli: () => void;
  loading: boolean;
}

export function OnboardingView({ onInitProject, onInstallCli, loading }: OnboardingViewProps) {
  const { t } = useTranslation();

  return (
    <div className="py-12 max-w-2xl mx-auto text-center">
      <div className="w-16 h-16 rounded-2xl bg-vscode-accent/15 border border-vscode-accent/30 flex items-center justify-center mx-auto mb-6 text-vscode-accent shadow-inner">
        <OpenSpecLogo className="w-9 h-9" />
      </div>

      <h2 className="text-2xl font-bold tracking-tight mb-2">{t('onboarding.welcomeTitle')}</h2>
      <p className="text-vscode-muted text-sm max-w-md mx-auto mb-8">
        {t('onboarding.welcomeDesc')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-8">
        <Card className="hover:border-vscode-accent/50 transition-colors">
          <CardHeader>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2">
              <Icon path={mdiRocketLaunchOutline} className="w-4 h-4" />
            </div>
            <CardTitle>{t('onboarding.initTitle')}</CardTitle>
            <CardDescription>
              {t('onboarding.initDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="default"
              size="md"
              className="w-full"
              disabled={loading}
              onClick={onInitProject}
            >
              {loading ? t('onboarding.initializing') : t('onboarding.initButton')}
              <Icon path={mdiArrowRight} className="w-4 h-4 ml-1.5" />
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-vscode-accent/50 transition-colors">
          <CardHeader>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center mb-2">
              <Icon path={mdiConsole} className="w-4 h-4" />
            </div>
            <CardTitle>{t('onboarding.installCliTitle')}</CardTitle>
            <CardDescription>
              {t('onboarding.installCliDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="secondary"
              size="md"
              className="w-full"
              disabled={loading}
              onClick={onInstallCli}
            >
              {t('onboarding.installCliButton')}
              <Icon path={mdiArrowRight} className="w-4 h-4 ml-1.5" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="bg-vscode-card/50 border border-vscode-border/50 rounded-lg p-4 text-left text-xs text-vscode-muted">
        <div className="font-medium text-vscode-fg mb-1 flex items-center gap-1.5">
          <Icon path={mdiCheckCircle} className="w-3.5 h-3.5 text-emerald-400" /> {t('onboarding.featuresTitle')}
        </div>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li>{t('onboarding.feature1')}</li>
          <li>{t('onboarding.feature2')}</li>
          <li>{t('onboarding.feature3')}</li>
        </ul>
      </div>
    </div>
  );
}
