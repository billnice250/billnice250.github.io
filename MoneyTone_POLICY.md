# MoneyTone Policy

Effective date: February 1, 2026

This document describes how the MoneyTone app handles your data.

## Summary

- MoneyTone is local-first: your data is stored on your device by default.
- Optional Google Drive backups are available when you connect a Google account.
- Local export is password-protected; you choose the password for exported backups.
- The app does not include analytics or advertising SDKs in this codebase.

## Data We Store

The app stores the following information you enter:

- Activities (groups)
- People names within activities
- Loans (amount, currency, lender/borrower, dates, description, APR, status)
- Repayments (amount, date, note)
- User profile and settings (name, locale, default currency, biometrics toggle, Drive sync settings)
- Google account identifiers (ID/email) if you connect Google Drive

This data is stored locally in an on-device SQLite database.

## Notifications

If you set due dates, the app can schedule local notifications. On Android 13+, the app requests notification permission at first run. Notifications are generated on-device and are not sent to any server.

## Google Drive Backups (Optional)

If you enable Drive sync, MoneyTone uses Google Sign-In and the Google Drive API to upload, list, download, and delete encrypted backup files in your Drive. The app may perform automatic periodic backups and can restore from the most recent Drive backup when enabled.

Drive backups are encrypted on-device using AES-GCM with a key derived via PBKDF2. For Drive backups, the key is app-managed (you are not prompted for a password).

## Local Export (Password-Protected)

You can create an encrypted backup file for local export or sharing. Local export uses AES-GCM with a key derived from a password you choose via PBKDF2. The password is required to restore the backup.

## Data Sharing

MoneyTone does not send your data to any app-controlled server. The only network transfer in the app is optional Google Drive backup/restore when you enable it.

## Data Retention and Deletion

Your data remains on your device until you delete it in the app or remove the app. Deleting local app data does not delete Google Drive backups; you must remove those from Drive separately.

## Children’s Privacy

MoneyTone is not designed for children and does not knowingly collect personal data from children.

## Security

We use local storage and strong encryption for backups. No system can be guaranteed 100% secure; you are responsible for keeping your device and any backup passwords secure.

## Changes to This Policy

We may update this policy as the app evolves. Material changes will be documented by updating the effective date above.

## Contact

For questions about this policy, add a support contact here:

- Email: billnice2k15@gmail.com
