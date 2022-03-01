import { ReputationLevel, OAuthProvider } from "@interep/reputation"
import { TelegramGroup } from "@interep/telegram-bot"
import { EmailDomain } from "src/core/email"
import { PoapEvent } from "src/core/poap"
import { OnchainGroups } from "src/core/onchain"

export type Provider = OAuthProvider | "poap" | "telegram" | "email" | "onchain"
export type GroupName = ReputationLevel | PoapEvent | TelegramGroup | EmailDomain | OnchainGroups

export type Group = {
    provider: Provider
    name: GroupName
    rootHash: string
    size: number
}

export type Groups = Group[]
